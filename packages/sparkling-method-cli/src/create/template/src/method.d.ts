/** Simple case for displaying a toast. */
export interface ShowToastRequest {
  message: string;
  /**
   * @default 2000
   */
  duration?: number;
}

export interface ShowToastResponse {
  /**
   * @default true
   */
  success: boolean;
}

declare function showToast(params: ShowToastRequest, callback: (result: ShowToastResponse) => void): void;
