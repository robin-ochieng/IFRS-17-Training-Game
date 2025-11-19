import { saveGameProgress, loadGameProgress } from './modules/supabaseService';

// Mock the supabase client
const mockUpsert = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockMaybeSingle = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      if (table === 'game_progress') {
        return {
          upsert: mockUpsert.mockReturnValue({ error: null }),
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              maybeSingle: mockMaybeSingle
            })
          }),
          insert: jest.fn().mockReturnValue({ error: null }),
          delete: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ error: null }) })
        };
      }
      if (table === 'users') {
        return {
          update: mockUpdate.mockReturnValue({ eq: jest.fn().mockReturnValue({ error: null }) }),
          select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: jest.fn().mockReturnValue({ data: {}, error: null }) }) })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
      };
    },
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    }
  })
}));

describe('Persistence Implementation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('saveGameProgress includes module_completion_times', async () => {
    const userId = 'test-user-123';
    const progressData = {
      currentModule: 2,
      score: 500,
      moduleCompletionTimes: {
        1: 120, // 2 minutes
        2: 180  // 3 minutes
      }
    };

    await saveGameProgress(userId, progressData);

    // Verify upsert was called with correct payload
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    const payload = mockUpsert.mock.calls[0][0];
    
    expect(payload).toEqual(expect.objectContaining({
      user_id: userId,
      module_completion_times: {
        1: 120,
        2: 180
      }
    }));
  });

  test('loadGameProgress retrieves module_completion_times', async () => {
    const userId = 'test-user-123';
    const mockDbData = {
      user_id: userId,
      module_completion_times: {
        1: 120,
        2: 180
      }
    };

    mockMaybeSingle.mockResolvedValue({ data: mockDbData, error: null });

    const result = await loadGameProgress(userId);

    expect(result).toEqual(mockDbData);
    expect(result.module_completion_times).toEqual({
      1: 120,
      2: 180
    });
  });
});
