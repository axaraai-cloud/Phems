import { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  File as FileIcon, 
  Upload, 
  Search, 
  MoreVertical, 
  Download, 
  Trash2,
  FileAudio,
  FileImage,
  FileText,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface FileMetadata {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  createdAt: any;
}

export default function FileVault() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'files'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FileMetadata[];
      setFiles(filesData);
      setLoading(false);
    }, (error) => {
      console.error('Firestore Error:', error);
      toast.error('Failed to load files');
    });

    return () => unsubscribe();
  }, []);

  const handleMockUpload = async () => {
    const fileName = prompt('Enter mock file name:');
    if (!fileName) return;

    try {
      await addDoc(collection(db, 'files'), {
        name: fileName,
        url: 'https://example.com/mock-file',
        type: fileName.split('.').pop() || 'unknown',
        size: Math.floor(Math.random() * 10000000),
        uploadedBy: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      });
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteDoc(doc(db, 'files', id));
      toast.success('File deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mp3':
      case 'wav':
      case 'flac':
        return FileAudio;
      case 'jpg':
      case 'png':
      case 'svg':
        return FileImage;
      case 'pdf':
      case 'doc':
      case 'txt':
        return FileText;
      default:
        return FileIcon;
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">File Vault</h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">SECURE ASSET STORAGE // STORAGE_01</p>
        </div>
        <Button onClick={handleMockUpload} className="bg-white text-black hover:bg-zinc-200 gap-2">
          <Upload className="w-4 h-4" />
          Upload File
        </Button>
      </header>

      <Card className="bg-[#151619] border-[#2a2b2e] text-white">
        <CardHeader className="pb-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Search assets..." 
              className="pl-10 bg-[#0a0a0a] border-[#2a2b2e] focus:ring-1 focus:ring-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2a2b2e] text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
                  <th className="pb-4 font-normal">Name</th>
                  <th className="pb-4 font-normal">Type</th>
                  <th className="pb-4 font-normal">Size</th>
                  <th className="pb-4 font-normal">Date</th>
                  <th className="pb-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2b2e]/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono text-xs">
                      Scanning storage...
                    </td>
                  </tr>
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono text-xs">
                      No assets found
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => {
                    const Icon = getFileIcon(file.type);
                    return (
                      <tr key={file.id} className="group hover:bg-[#2a2b2e]/20 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#2a2b2e] rounded group-hover:bg-white group-hover:text-black transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-xs font-mono text-zinc-500 uppercase">{file.type}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-xs font-mono text-zinc-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-xs font-mono text-zinc-500">
                            {file.createdAt?.seconds ? format(new Date(file.createdAt.seconds * 1000), 'MMM d, yyyy') : '...'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-zinc-500 hover:text-white hover:bg-[#2a2b2e]/50 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#151619] border-[#2a2b2e] text-white">
                              <DropdownMenuItem className="gap-2 focus:bg-[#2a2b2e] focus:text-white cursor-pointer">
                                <Download className="w-4 h-4" /> Download
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2 text-red-400 focus:bg-red-400/10 focus:text-red-400 cursor-pointer"
                                onClick={() => handleDelete(file.id)}
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
