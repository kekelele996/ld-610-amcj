import { useCallback, useState } from "react";
import type { RestorationStep } from "../types/RestorationStep";
import type { ApiError } from "../api/client";

interface StepExecutionState {
  acting: boolean;
  failure: { code: string; message: string } | null;
  startStep: (id: number) => Promise<RestorationStep | ApiError | null>;
  finishStep: (id: number, note?: string) => Promise<RestorationStep | ApiError | null>;
  registerStep: (payload: { plan_id: number; technique: string; material_used?: string }) => Promise<RestorationStep | ApiError | null>;
  clearFailure: () => void;
}

// 步骤执行 hook：所有“跳过审批 / 退回期间执行 / 跳序执行”的失败原因都会透出
type StepActionResult = RestorationStep | ApiError;

export function useStepExecution(actions: {
  start: (id: number) => Promise<StepActionResult>;
  finish: (id: number, note?: string) => Promise<StepActionResult>;
  register: (payload: { plan_id: number; technique: string; material_used?: string }) => Promise<StepActionResult>;
}): StepExecutionState {
  const [acting, setActing] = useState(false);
  const [failure, setFailure] = useState<{ code: string; message: string } | null>(null);

  const run = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setActing(true);
      setFailure(null);
      try {
        return await fn();
      } catch (error) {
        const apiError = error as ApiError;
        setFailure({ code: apiError.code, message: apiError.message });
        return null;
      } finally {
        setActing(false);
      }
    },
    []
  );

  return {
    acting,
    failure,
    clearFailure: () => setFailure(null),
    startStep: (id) => run(() => actions.start(id)),
    finishStep: (id, note) => run(() => actions.finish(id, note)),
    registerStep: (payload) => run(() => actions.register(payload))
  };
}
