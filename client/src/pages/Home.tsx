import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link } from "wouter";
import { Plus, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", genre: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { data: games, isLoading, refetch } = trpc.games.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.games.create.useMutation({
    onSuccess: () => {
      toast.success("Jogo criado com sucesso!");
      setFormData({ name: "", description: "", genre: "" });
      setSelectedFile(null);
      setPreviewUrl("");
      setOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar jogo");
    },
  });

  const uploadMutation = trpc.upload.gameCover.useMutation({
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer upload da imagem");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande (máximo 5MB)");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nome do jogo é obrigatório");
      return;
    }

    try {
      const gameResult = await createMutation.mutateAsync(formData);
      
      if (selectedFile && gameResult) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          await uploadMutation.mutateAsync({
            gameId: gameResult.id,
            fileData: base64,
            fileName: selectedFile.name,
          });
          refetch();
        };
        reader.readAsDataURL(selectedFile);
      }
    } catch (error) {
      console.error("Erro ao criar jogo:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">RPG Manager</h1>
          <p className="text-xl text-gray-300 mb-8">Gerencie seus jogos de RPG presencial</p>
          <Button size="lg" asChild>
            <a href={`${window.location.origin}/api/oauth/login`}>Fazer Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Meus Jogos</h1>
            <p className="text-gray-400">Bem-vindo, {user?.name}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus size={20} />
                Novo Jogo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-purple-500">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Novo Jogo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Nome do Jogo</label>
                  <Input
                    placeholder="Ex: Dungeons & Dragons"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Gênero</label>
                  <Input
                    placeholder="Ex: Fantasy, Sci-Fi"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Descrição</label>
                  <Textarea
                    placeholder="Descreva seu jogo..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Capa do Jogo (Opcional)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    {previewUrl && (
                      <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded object-cover" />
                    )}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || uploadMutation.isPending} 
                  className="w-full"
                >
                  {createMutation.isPending || uploadMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Criar"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-purple-500" size={40} />
          </div>
        ) : games && games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Link key={game.id} href={`/game/${game.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative rounded-lg overflow-hidden h-64 flex flex-col justify-between hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105">
                    {game.imageUrl ? (
                      <img 
                        src={game.imageUrl} 
                        alt={game.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all" />
                    <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{game.name}</h2>
                        <p className="text-purple-200 text-sm mb-2">{game.genre}</p>
                        <p className="text-gray-200 text-sm line-clamp-2">{game.description}</p>
                      </div>
                      <div className="text-xs text-purple-100">
                        Clique para ver personagens →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">Nenhum jogo criado ainda</p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Criar seu primeiro jogo</Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-purple-500">
                <DialogHeader>
                  <DialogTitle className="text-white">Criar Novo Jogo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Nome do Jogo</label>
                    <Input
                      placeholder="Ex: Dungeons & Dragons"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Gênero</label>
                    <Input
                      placeholder="Ex: Fantasy, Sci-Fi"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Descrição</label>
                    <Textarea
                      placeholder="Descreva seu jogo..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Capa do Jogo (Opcional)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                      {previewUrl && (
                        <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded object-cover" />
                      )}
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || uploadMutation.isPending} 
                    className="w-full"
                  >
                    {createMutation.isPending || uploadMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Criar"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
