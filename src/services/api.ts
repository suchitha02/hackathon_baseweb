// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API Error:', error);
    return { data: null, error: error as Error };
  }
}

// Auth API
export const authAPI = {
  async signUp(email: string, password: string, userData: { full_name: string; username: string }) {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...userData }),
    });
  },

  async signIn(email: string, password: string) {
    const result = await apiCall<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (result.data?.token) {
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    
    return result;
  },

  async signOut() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    return { data: null, error: null };
  },

  async getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return { data: { user: null }, error: null };
    }
    
    const user = JSON.parse(userStr);
    return { data: { user }, error: null };
  },

  async updateProfile(userId: string, updates: any) {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// Posts API
export const postsAPI = {
  async getPosts(filters?: { status?: string; lookingForTeammates?: boolean; orderBy?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.lookingForTeammates) params.append('lookingForTeammates', 'true');
    if (filters?.orderBy) params.append('orderBy', filters.orderBy);
    
    return apiCall(`/posts?${params.toString()}`, { method: 'GET' });
  },

  async getPostById(id: string) {
    return apiCall(`/posts/${id}`, { method: 'GET' });
  },

  async createPost(postData: any) {
    return apiCall('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  async updatePost(id: string, updates: any) {
    return apiCall(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deletePost(id: string) {
    return apiCall(`/posts/${id}`, { method: 'DELETE' });
  },

  async likePost(postId: string, userId: string) {
    return apiCall(`/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  async unlikePost(postId: string, userId: string) {
    return apiCall(`/posts/${postId}/unlike`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  async checkLike(postId: string, userId: string) {
    return apiCall(`/posts/${postId}/likes/${userId}`, { method: 'GET' });
  },
};

// Comments API
export const commentsAPI = {
  async getComments(postId: string) {
    return apiCall(`/posts/${postId}/comments`, { method: 'GET' });
  },

  async createComment(postId: string, content: string, authorId: string) {
    return apiCall(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, authorId }),
    });
  },

  async deleteComment(commentId: string) {
    return apiCall(`/comments/${commentId}`, { method: 'DELETE' });
  },
};

// Teams API
export const teamsAPI = {
  async getTeams() {
    return apiCall('/teams', { method: 'GET' });
  },

  async getTeamById(id: string) {
    return apiCall(`/teams/${id}`, { method: 'GET' });
  },

  async createTeam(teamData: { name: string; description: string; creatorId: string }) {
    return apiCall('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  },

  async updateTeam(id: string, updates: any) {
    return apiCall(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteTeam(id: string) {
    return apiCall(`/teams/${id}`, { method: 'DELETE' });
  },

  async getTeamMembers(teamId: string) {
    return apiCall(`/teams/${teamId}/members`, { method: 'GET' });
  },

  async addTeamMember(teamId: string, userId: string, role: string = 'member') {
    return apiCall(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  },

  async removeTeamMember(teamId: string, userId: string) {
    return apiCall(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
  },
};

// Tasks API (Kanban)
export const tasksAPI = {
  async getTasks(filters?: { status?: string; userId?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId);
    
    return apiCall(`/tasks?${params.toString()}`, { method: 'GET' });
  },

  async getTaskById(id: string) {
    return apiCall(`/tasks/${id}`, { method: 'GET' });
  },

  async createTask(taskData: any) {
    return apiCall('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(id: string, updates: any) {
    return apiCall(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteTask(id: string) {
    return apiCall(`/tasks/${id}`, { method: 'DELETE' });
  },
};

// Users API
export const usersAPI = {
  async getUserById(id: string) {
    return apiCall(`/users/${id}`, { method: 'GET' });
  },

  async getUserPosts(userId: string) {
    return apiCall(`/users/${userId}/posts`, { method: 'GET' });
  },

  async getUserInterests(userId: string) {
    return apiCall(`/users/${userId}/interests`, { method: 'GET' });
  },

  async updateUserInterests(userId: string, tagIds: string[]) {
    return apiCall(`/users/${userId}/interests`, {
      method: 'PUT',
      body: JSON.stringify({ tagIds }),
    });
  },

  async followUser(followerId: string, followingId: string) {
    return apiCall('/follows', {
      method: 'POST',
      body: JSON.stringify({ followerId, followingId }),
    });
  },

  async unfollowUser(followerId: string, followingId: string) {
    return apiCall(`/follows/${followerId}/${followingId}`, { method: 'DELETE' });
  },

  async checkFollow(followerId: string, followingId: string) {
    return apiCall(`/follows/${followerId}/${followingId}`, { method: 'GET' });
  },

  async getFollowers(userId: string) {
    return apiCall(`/users/${userId}/followers`, { method: 'GET' });
  },

  async getFollowing(userId: string) {
    return apiCall(`/users/${userId}/following`, { method: 'GET' });
  },
};

// Tags API
export const tagsAPI = {
  async getTags() {
    return apiCall('/tags', { method: 'GET' });
  },

  async createTag(name: string) {
    return apiCall('/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
};

// Notifications API
export const notificationsAPI = {
  async getNotifications(userId: string) {
    return apiCall(`/users/${userId}/notifications`, { method: 'GET' });
  },

  async markAsRead(notificationId: string) {
    return apiCall(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead(userId: string) {
    return apiCall(`/users/${userId}/notifications/read-all`, {
      method: 'PUT',
    });
  },

  async deleteNotification(notificationId: string) {
    return apiCall(`/notifications/${notificationId}`, { method: 'DELETE' });
  },
};

// Dashboard API
export const dashboardAPI = {
  async getStats(userId: string) {
    return apiCall(`/users/${userId}/stats`, { method: 'GET' });
  },

  async getRecentPosts(userId: string, limit: number = 5) {
    return apiCall(`/users/${userId}/posts?limit=${limit}`, { method: 'GET' });
  },
};
