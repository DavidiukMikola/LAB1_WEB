import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { apiRequest } from '../../api/client';

function normalizeResults(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }
  return [];
}

export const loadQuestions = createAsyncThunk('questions/loadQuestions', async () => {
  return apiRequest('/api/questions/').then((payload) => ({
    items: normalizeResults(payload),
    count: payload.count ?? normalizeResults(payload).length,
  }));
});

export const loadQuestion = createAsyncThunk('questions/loadQuestion', async (slug) => {
  const question = await apiRequest(`/api/questions/${slug}/`);
  const answersPayload = await apiRequest(`/api/answers/?question=${question.id}`);
  return {
    question,
    answers: normalizeResults(answersPayload),
  };
});

export const createQuestion = createAsyncThunk('questions/createQuestion', async (payload, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  return apiRequest('/api/questions/', {
    method: 'POST',
    token: auth.token,
    body: payload,
  });
});

export const createAnswer = createAsyncThunk('questions/createAnswer', async (payload, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  return apiRequest('/api/answers/', {
    method: 'POST',
    token: auth.token,
    body: payload,
  });
});

export const voteAnswer = createAsyncThunk('questions/voteAnswer', async (payload, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  return apiRequest('/api/answers/vote/', {
    method: 'POST',
    token: auth.token,
    body: payload,
  });
});

const initialState = {
  items: [],
  count: 0,
  status: 'idle',
  error: null,
  currentQuestion: null,
  answers: [],
  detailStatus: 'idle',
  detailError: null,
  mutationStatus: 'idle',
  mutationError: null,
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    clearCurrentQuestion(state) {
      state.currentQuestion = null;
      state.answers = [];
      state.detailStatus = 'idle';
      state.detailError = null;
    },
    clearMutationState(state) {
      state.mutationStatus = 'idle';
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadQuestions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadQuestions.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.count = action.payload.count;
        state.status = 'succeeded';
      })
      .addCase(loadQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Не вдалося завантажити питання';
      })
      .addCase(loadQuestion.pending, (state) => {
        state.detailStatus = 'loading';
        state.detailError = null;
      })
      .addCase(loadQuestion.fulfilled, (state, action) => {
        state.currentQuestion = action.payload.question;
        state.answers = action.payload.answers;
        state.detailStatus = 'succeeded';
      })
      .addCase(loadQuestion.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.error.message || 'Не вдалося завантажити питання';
      })
      .addCase(createQuestion.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.count += 1;
        state.mutationStatus = 'succeeded';
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message || 'Не вдалося створити питання';
      })
      .addCase(createAnswer.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createAnswer.fulfilled, (state, action) => {
        state.answers = [action.payload, ...state.answers];
        if (state.currentQuestion) {
          state.currentQuestion = {
            ...state.currentQuestion,
            answers_count: (state.currentQuestion.answers_count || 0) + 1,
          };
        }
        state.mutationStatus = 'succeeded';
      })
      .addCase(createAnswer.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message || 'Не вдалося додати відповідь';
      })
      .addCase(voteAnswer.fulfilled, (state, action) => {
        state.answers = state.answers.map((answer) =>
          answer.id === action.payload.id ? action.payload : answer
        );
      });
  },
});

export const { clearCurrentQuestion, clearMutationState } = questionsSlice.actions;

export const selectQuestions = (state) => state.questions.items;
export const selectQuestionsStatus = (state) => state.questions.status;
export const selectQuestionsError = (state) => state.questions.error;
export const selectQuestionDetail = (state) => state.questions.currentQuestion;
export const selectQuestionAnswers = (state) => state.questions.answers;
export const selectQuestionDetailStatus = (state) => state.questions.detailStatus;
export const selectQuestionDetailError = (state) => state.questions.detailError;
export const selectMutationStatus = (state) => state.questions.mutationStatus;
export const selectMutationError = (state) => state.questions.mutationError;

export default questionsSlice.reducer;
