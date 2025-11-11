import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Treaty } from '@elysiajs/eden'
import TreatyResponse = Treaty.TreatyResponse

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ServerFnType<Res extends Record<number, unknown>> = () => Promise<TreatyResponse<Res>>

/**
 * Provide type support for backend requests.
 * @param serverFn
 */
export const wrappedFetch = async <
  Res = unknown,
  Fn extends ServerFnType<Record<200, Res>> = ServerFnType<Record<200, Res>>,
>(
  serverFn: Fn,
) => {
  return serverFn()
}