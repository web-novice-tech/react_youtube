import { useState } from "react";

// どのタイプのエラーなのかを管理するための型
// main: 認証全体での、ネットワークエラーやそのサーバー側のエラーを格納
// name: Name入力フォームに関するエラー
// email: Email入力フォームに関するエラー
// password: Password入力フォームに関するエラー
export type ErrorState = "main" | "name" | "email" | "password";
export type SetErrorFn = (name: ErrorState, message: string) => void;

/**
 * useAuthHelper()をするときに、呼び出し元からそれぞれの処理の実態を注入する
 * @param executeProcess 実際に認証処理の実態を外部から追加する
 * @param formValidation バリデーションチェックの実態を外部から追加する
 * @returns
 */
export const useAuthHelper = (
  executeProcess: () => Promise<void>,
  formValidation: (setError: SetErrorFn) => boolean
) => {
  // 複数のエラーを同時に管理できるようにするためのstate
  // Mapは { key: value } の形でオブジェクトを管理できるJavaScriptのデータ構造
  // ただのObjectと違い、便利なメソッドが用意されている。
  const [error, setError] = useState<Map<ErrorState, string>>(new Map());

  const [loading, setLoading] = useState<boolean>(false);

  // エラーをセットする
  const setErrorHandler: SetErrorFn = (name, message) => {
    setError(prev => new Map(prev.set(name, message)));
  };

  const authExecute = async() => {
    // 認証を実行したら一度エラー文をリセットする。これをしないと不要なエラーメッセージが表示されたままになる
    setError(new Map());

    // バリデーションの確認を行う
    const invalidValidation = formValidation(setErrorHandler);

    if(invalidValidation) return;

    setLoading(true);

    try {
      // 認証ロジックを実行。成功すれば、リダイレクト処理（この処理はここには書いていない）
      await executeProcess();
    } catch(error: any) {
      // エラーがあれば、エラーをセットして処理を中断
      setErrorHandler("main", error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    authExecute,
    loading,
    error,
    setErrorHandler
  }
}