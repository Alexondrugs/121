import create from 'zustand'
import type { Column, Task } from '../types'

type BoardState = {
  columns: Column[]
  tasks: Task[]
  setColumns: (cols: Column[]) => void
  setTasks: (tasks: Task[]) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  columns: [],
  tasks: [],
  setColumns: (columns) => set({ columns }),
  setTasks: (tasks) => set({ tasks })
}))


