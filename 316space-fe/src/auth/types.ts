export interface TokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  role: string
}

export interface StoredAuth {
  accessToken: string
  role: string
  email: string
}
