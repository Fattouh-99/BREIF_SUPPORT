/**
 * Simple background task queue system for processing operations asynchronously
 * In production, would use a proper task queue like Bull/Redis
 */

type Task = {
  id: string;
  type: string;
  data: any;
  createdAt: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: any;
}

type TaskHandler = (data: any) => Promise<any>;

class TaskQueue {
  private tasks: Map<string, Task> = new Map();
  private handlers: Map<string, TaskHandler> = new Map();
  private isProcessing: boolean = false;
  private processInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Start processing tasks
    this.startProcessing();
  }
  
  /**
   * Register a handler for a specific task type
   */
  registerHandler(taskType: string, handler: TaskHandler) {
    this.handlers.set(taskType, handler);
    console.log(`[TaskQueue] Registered handler for ${taskType}`);
  }
  
  /**
   * Add a task to the queue
   */
  async addTask(taskType: string, data: any): Promise<string> {
    const taskId = `${taskType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: Task = {
      id: taskId,
      type: taskType,
      data,
      createdAt: Date.now(),
      status: 'pending'
    };
    
    this.tasks.set(taskId, task);
    console.log(`[TaskQueue] Added task ${taskId} of type ${taskType}`);
    
    return taskId;
  }
  
  /**
   * Get the status of a task
   */
  getTaskStatus(taskId: string): Task | null {
    return this.tasks.get(taskId) || null;
  }
  
  /**
   * Start processing tasks in the background
   */
  private startProcessing() {
    if (this.processInterval) {
      clearInterval(this.processInterval);
    }
    
    this.processInterval = setInterval(() => {
      this.processNextTask();
    }, 1000); // Process every second
  }
  
  /**
   * Process the next pending task
   */
  private async processNextTask() {
    if (this.isProcessing) return;
    
    // Find the oldest pending task
    let nextTask: Task | null = null;
    let oldestTime = Infinity;
    
    // Use Array.from to avoid iteration issues
    const tasks = Array.from(this.tasks.values());
    
    tasks.forEach((task: Task) => {
      if (task.status === 'pending' && task.createdAt < oldestTime) {
        nextTask = task;
        oldestTime = task.createdAt;
      }
    });
    
    if (!nextTask) return;
    
    // Use type assertion to tell TypeScript that nextTask is not null here
    const taskToProcess = nextTask as Task;
    
    // Get the handler for this task type
    const handler = this.handlers.get(taskToProcess.type);
    if (!handler) {
      console.error(`[TaskQueue] No handler found for task type ${taskToProcess.type}`);
      
      // Mark as failed
      taskToProcess.status = 'failed';
      taskToProcess.error = 'No handler registered for this task type';
      this.tasks.set(taskToProcess.id, taskToProcess);
      return;
    }
    
    // Process the task
    this.isProcessing = true;
    taskToProcess.status = 'processing';
    this.tasks.set(taskToProcess.id, taskToProcess);
    
    try {
      console.log(`[TaskQueue] Processing task ${taskToProcess.id}`);
      const result = await handler(taskToProcess.data);
      
      // Mark as completed
      taskToProcess.status = 'completed';
      taskToProcess.result = result;
    } catch (error) {
      console.error(`[TaskQueue] Error processing task ${taskToProcess.id}:`, error);
      
      // Mark as failed
      taskToProcess.status = 'failed';
      taskToProcess.error = error;
    } finally {
      this.tasks.set(taskToProcess.id, taskToProcess);
      this.isProcessing = false;
      
      // Clean up old completed/failed tasks
      this.cleanupOldTasks();
    }
  }
  
  /**
   * Clean up old tasks to prevent memory leaks
   */
  private cleanupOldTasks() {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    
    // Use Array.from to avoid iteration issues
    const entries = Array.from(this.tasks.entries());
    
    entries.forEach(([taskId, task]: [string, Task]) => {
      // Keep pending and processing tasks
      if (task.status === 'pending' || task.status === 'processing') {
        return;
      }
      
      // Remove completed/failed tasks older than 1 hour
      if (now - task.createdAt > ONE_HOUR) {
        this.tasks.delete(taskId);
      }
    });
  }
  
  /**
   * Stop the task queue (for cleanup)
   */
  stop() {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
  }
}

// Create a singleton instance
export const taskQueue = new TaskQueue();

// Register common task handlers
taskQueue.registerHandler('syncUserMetadata', async (data) => {
  // Would implement logic to sync user metadata with external systems
  console.log('[Task] Syncing user metadata for', data.userId);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
  return { success: true };
});

taskQueue.registerHandler('sendWelcomeEmail', async (data) => {
  // Would implement logic to send welcome email
  console.log('[Task] Sending welcome email to', data.email);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work
  return { emailSent: true };
});

// Export helper functions
export const addBackgroundTask = taskQueue.addTask.bind(taskQueue);
export const getTaskStatus = taskQueue.getTaskStatus.bind(taskQueue); 