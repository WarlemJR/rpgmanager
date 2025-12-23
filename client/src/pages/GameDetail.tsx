import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { Plus, Loader2, ArrowLeft, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function GameDetail() {
  const { gameId } = useParams<{ gameId: string }>();
  const id = parseInt(gameId || "0");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", history: "" });

  const { data: game, isLoading: gameLoading } = trpc.games.get.useQuery(
    { id },
    { enabled: id > 0 }
  );

  const { data: characters, refetch } = trpc.characters.listByGame.useQuery(
    { gameId: id },
    { enabled: id > 0 }
  );

  const createMutation = trpc.characters.create.useMutation({
    onSuccess: () => {
      toast.success("Personagem criado com sucesso!");
      setFormData({ name: "", description: "", history: "" });
      setOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar personagem");
    },
  });

  const updateMutation = trpc.characters.update.useMutation({
    onSuccess: () => {
      toast.success("Personagem atualizado com sucesso!");
      setFormData({ name: "", description: "", history: "" });
      setEditingId(null);
      setOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar personagem");
    },
  });

  const deleteMutation = trpc.characters.delete.useMutation({
    onSuccess: () => {
      toast.success("Personagem deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar personagem");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nome do personagem é obrigatório");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate({ gameId: id, ...formData });
    }
  };

  const handleEdit = (character: any) => {
    setEditingId(character.id);
    setFormData({
      name: character.name,
      description: character.description || "",
      history: character.history || "",
    });
    setOpen(true);
  };

  if (gameLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Jogo não encontrado</p>
          <Link href="/">
            <Button>Voltar</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{game.name}</h1>
            <p className="text-gray-400">{game.genre}</p>
            <p className="text-gray-500 text-sm mt-2">{game.description}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2" onClick={() => setEditingId(null)}>
                <Plus size={20} />
                Novo Personagem
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-purple-500">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingId ? "Editar Personagem" : "Criar Novo Personagem"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Nome</label>
                  <Input
                    placeholder="Nome do personagem"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Descrição</label>
                  <Textarea
                    placeholder="Descrição do personagem"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">História</label>
                  <Textarea
                    placeholder="História do personagem"
                    value={formData.history}
                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : editingId ? (
                    "Atualizar"
                  ) : (
                    "Criar"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Characters Grid */}
        {characters && characters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <Link key={character.id} href={`/character/${character.id}`}>
                <div className="group cursor-pointer">
                  <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-lg p-6 h-64 flex flex-col justify-between hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105 relative">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleEdit(character);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} className="text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm("Tem certeza que deseja deletar este personagem?")) {
                            deleteMutation.mutate({ id: character.id });
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{character.name}</h2>
                      <p className="text-orange-100 text-sm line-clamp-3">{character.description}</p>
                    </div>
                    <div className="text-xs text-orange-100">
                      Clique para ver detalhes →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">Nenhum personagem criado ainda</p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingId(null)}>Criar seu primeiro personagem</Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-purple-500">
                <DialogHeader>
                  <DialogTitle className="text-white">Criar Novo Personagem</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Nome</label>
                    <Input
                      placeholder="Nome do personagem"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Descrição</label>
                    <Textarea
                      placeholder="Descrição do personagem"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">História</label>
                    <Textarea
                      placeholder="História do personagem"
                      value={formData.history}
                      onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <Button type="submit" disabled={createMutation.isPending} className="w-full">
                    {createMutation.isPending ? <Loader2 className="animate-spin" /> : "Criar"}
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
