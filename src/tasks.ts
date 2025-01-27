import whenReady from './whenReady'
import state from './state'
import { startTracking } from './tracking'

export type Task = {
    priority: 'background' | 'user-visible'
    ready: Promise<void>
    resolve: () => void
}

/**
 * Adds a task to the queue and returns the new task.
 * @param priority {('background' | 'user-visible')} The priority of the new task.
 */
export function createTask(priority: 'background' | 'user-visible'): Task {
    const wr = whenReady()
    const item = { priority, ready: wr.promise, resolve: wr.resolve }
    const insertIndex =
        priority === 'user-visible'
            ? 0
            : state.tasks.findIndex((deferred) => deferred.priority === 'user-visible')

    state.tasks.splice(insertIndex === -1 ? 0 : insertIndex, 0, item)

    if (state.tasks.length === 1) {
        startTracking()
    }

    return item
}

/**
 * Remove the task from the queue. This happens when we execute this task and it's time for the next
 * one. Call `nextDeferred()` in order to start executing the next task.
 * @param task {Task}
 */
export function removeTask(task: Task): void {
    const index = state.tasks.indexOf(task)

    // istanbul ignore if
    if (index === -1) {
        // silentError()
    } else {
        state.tasks.splice(index, 1)
    }
}

/**
 * Resolve the last task in the queue. This triggers executing the task by resolving the promise
 * inside `yieldControl()` function.
 */
export function nextTask(): void {
    const task = state.tasks[0]
    if (task !== undefined) {
        task.resolve()
    }
}
