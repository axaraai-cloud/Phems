import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTask,
        status: 'todo',
        createdAt: serverTimestamp()
      });
      setNewTask('');
      toast.success('Task added');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await updateDoc(doc(db, 'tasks', task.id), { status: newStatus });
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Studio Tasks</h2>
        <p className="text-zinc-500 font-mono text-sm mt-1">PRODUCTION WORKFLOW // TASKS_01</p>
      </header>

      <form onSubmit={handleAddTask} className="flex gap-2">
        <Input 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..." 
          className="bg-[#151619] border-[#2a2b2e] focus:ring-1 focus:ring-white h-12"
        />
        <Button type="submit" className="bg-white text-black hover:bg-zinc-200 h-12 px-6">
          <Plus className="w-5 h-5" />
        </Button>
      </form>

      <div className="space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-[#151619] border border-[#2a2b2e] rounded-lg animate-pulse"></div>
          ))
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#2a2b2e] rounded-xl">
            <CheckSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-mono text-sm">All clear! No pending tasks.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className={cn(
              "bg-[#151619] border-[#2a2b2e] text-white transition-all duration-200 group",
              task.status === 'done' ? "opacity-50" : "hover:border-white/20"
            )}>
              <CardContent className="p-4 flex items-center gap-4">
                <button 
                  onClick={() => toggleTask(task)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                
                <span className={cn(
                  "flex-1 text-sm font-medium transition-all",
                  task.status === 'done' && "line-through text-zinc-500"
                )}>
                  {task.title}
                </span>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
