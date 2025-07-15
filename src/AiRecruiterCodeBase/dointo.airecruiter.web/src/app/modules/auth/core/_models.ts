export interface UserModel {
  name: string
  role: 'recruiter' | 'candidate'
}
export interface AuthModel {
  api_token: string
  refreshToken?: string
  user: UserModel
}