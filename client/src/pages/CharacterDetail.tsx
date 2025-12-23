import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useParams, Link } from "wouter";
import { Plus, Loader2, ArrowLeft, Trash2, Edit2, Minus } from "lucide-react";
import { toast } from "sonner";

export default function CharacterDetail() {
  const { characterId } = useParams<{ characterId: string }>();
  const id = parseInt(characterId || "0");
  const [openSkill, setOpenSkill] = useState(false);
  const [openAttribute, setOpenAttribute] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editingAttributeId, setEditingAttributeId] = useState<number | null>(null);
  const [skillForm, setSkillForm] = useState({ name: "", description: "", level: 1 });
  const [attributeForm, setAttributeForm] = useState({
    name: "",
    value: 10,
    minValue: 0,
    maxValue: 15,
  });

  const { data: character, isLoading: charLoading } = trpc.characters.get.useQuery(
    { id },
    { enabled: id > 0 }
  );

  const { data: attributes, refetch: refetchAttributes } = trpc.attributes.listByCharacter.useQuery(
    { characterId: id },
    { enabled: id > 0 }
  );

  const { data: skills, refetch: refetchSkills } = trpc.skills.listByCharacter.useQuery(
    { characterId: id },
    { enabled: id > 0 }
  );

  const createSkillMutation = trpc.skills.create.useMutation({
    onSuccess: () => {
      toast.success("Habilidade criada com sucesso!");
      setSkillForm({ name: "", description: "", level: 1 });
      setOpenSkill(false);
      refetchSkills();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar habilidade");
    },
  });

  const updateSkillMutation = trpc.skills.update.useMutation({
    onSuccess: () => {
      toast.success("Habilidade atualizada com sucesso!");
      setSkillForm({ name: "", description: "", level: 1 });
      setEditingSkillId(null);
      setOpenSkill(false);
      refetchSkills();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar habilidade");
    },
  });

  const deleteSkillMutation = trpc.skills.delete.useMutation({
    onSuccess: () => {
      toast.success("Habilidade deletada com sucesso!");
      refetchSkills();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar habilidade");
    },
  });

  const createAttributeMutation = trpc.attributes.create.useMutation({
    onSuccess: () => {
      toast.success("Atributo criado com sucesso!");
      setAttributeForm({ name: "", value: 10, minValue: 0, maxValue: 100 });
      setOpenAttribute(false);
      refetchAttributes();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar atributo");
    },
  });

  const updateAttributeMutation = trpc.attributes.update.useMutation({
    onSuccess: () => {
      toast.success("Atributo atualizado com sucesso!");
      setAttributeForm({ name: "", value: 10, minValue: 0, maxValue: 100 });
      setEditingAttributeId(null);
      setOpenAttribute(false);
      refetchAttributes();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar atributo");
    },
  });

  const deleteAttributeMutation = trpc.attributes.delete.useMutation({
    onSuccess: () => {
      toast.success("Atributo deletado com sucesso!");
      refetchAttributes();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar atributo");
    },
  });

  const handleSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name.trim()) {
      toast.error("Nome da habilidade é obrigatório");
      return;
    }

    if (editingSkillId) {
      updateSkillMutation.mutate({ id: editingSkillId, ...skillForm });
    } else {
      createSkillMutation.mutate({ characterId: id, ...skillForm });
    }
  };

  const handleAttributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attributeForm.name.trim()) {
      toast.error("Nome do atributo é obrigatório");
      return;
    }

    if (editingAttributeId) {
      updateAttributeMutation.mutate({ id: editingAttributeId, ...attributeForm });
    } else {
      createAttributeMutation.mutate({ characterId: id, ...attributeForm });
    }
  };

  const handleEditSkill = (skill: any) => {
    setEditingSkillId(skill.id);
    setSkillForm({
      name: skill.name,
      description: skill.description || "",
      level: skill.level,
    });
    setOpenSkill(true);
  };

  const handleEditAttribute = (attr: any) => {
    setEditingAttributeId(attr.id);
    setAttributeForm({
      name: attr.name,
      value: attr.value,
      minValue: attr.minValue,
      maxValue: attr.maxValue,
    });
    setOpenAttribute(true);
  };

  const handleIncreaseAttribute = (attrId: number, currentValue: number, maxValue: number) => {
    if (currentValue < maxValue) {
      updateAttributeMutation.mutate({ id: attrId, value: currentValue + 1 });
    }
  };

  const handleDecreaseAttribute = (attrId: number, currentValue: number, minValue: number) => {
    if (currentValue > minValue) {
      updateAttributeMutation.mutate({ id: attrId, value: currentValue - 1 });
    }
  };

  if (charLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Personagem não encontrado</p>
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
            <h1 className="text-4xl font-bold text-white mb-2">{character.name}</h1>
            <p className="text-gray-400">{character.description}</p>
          </div>
        </div>

        {/* Character History */}
        {character.history && (
          <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">História</h2>
            <p className="text-gray-300 leading-relaxed">{character.history}</p>
          </div>
        )}

        {/* Attributes Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Atributos</h2>
            <Dialog open={openAttribute} onOpenChange={setOpenAttribute}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setEditingAttributeId(null);
                    setAttributeForm({ name: "", value: 10, minValue: 0, maxValue: 15 });
                  }}
                >
                  <Plus size={16} />
                  Novo Atributo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-purple-500">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingAttributeId ? "Editar Atributo" : "Criar Novo Atributo"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAttributeSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Nome</label>
                    <Input
                      placeholder="Ex: Força, Inteligência"
                      value={attributeForm.name}
                      onChange={(e) => setAttributeForm({ ...attributeForm, name: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Valor</label>
                    <Input
                      type="number"
                      value={attributeForm.value}
                      onChange={(e) =>
                        setAttributeForm({ ...attributeForm, value: parseInt(e.target.value) })
                      }
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Mínimo</label>
                      <Input
                        type="number"
                        value={attributeForm.minValue}
                        onChange={(e) =>
                          setAttributeForm({ ...attributeForm, minValue: parseInt(e.target.value) })
                        }
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Máximo</label>
                      <Input
                        type="number"
                        value={attributeForm.maxValue}
                        onChange={(e) =>
                          setAttributeForm({ ...attributeForm, maxValue: parseInt(e.target.value) })
                        }
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={createAttributeMutation.isPending || updateAttributeMutation.isPending}
                    className="w-full"
                  >
                    {createAttributeMutation.isPending || updateAttributeMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : editingAttributeId ? (
                      "Atualizar"
                    ) : (
                      "Criar"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {attributes && attributes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attributes.map((attr) => (
                <div
                  key={attr.id}
                  className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg p-4 hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-white">{attr.name}</h3>
                  </div>

                  <div className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                    <button
                      onClick={() => handleDecreaseAttribute(attr.id, attr.value, attr.minValue)}
                      disabled={attr.value <= attr.minValue}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 p-2 rounded transition-colors"
                    >
                      <Minus size={18} className="text-white" />
                    </button>
                    <span className="text-3xl font-bold text-white w-16 text-center">{attr.value}</span>
                    <button
                      onClick={() => handleIncreaseAttribute(attr.id, attr.value, attr.maxValue)}
                      disabled={attr.value >= attr.maxValue}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 p-2 rounded transition-colors"
                    >
                      <Plus size={18} className="text-white" />
                    </button>
                  </div>

                  <div className="text-xs text-cyan-100 mt-2">
                    {attr.minValue} - {attr.maxValue}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Nenhum atributo criado ainda</p>
          )}
        </div>

        {/* Skills Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Habilidades</h2>
            <Dialog open={openSkill} onOpenChange={setOpenSkill}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setEditingSkillId(null);
                    setSkillForm({ name: "", description: "", level: 1 });
                  }}
                >
                  <Plus size={16} />
                  Nova Habilidade
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-purple-500">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingSkillId ? "Editar Habilidade" : "Criar Nova Habilidade"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSkillSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Nome</label>
                    <Input
                      placeholder="Nome da habilidade"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Descrição</label>
                    <Textarea
                      placeholder="Descrição da habilidade"
                      value={skillForm.description}
                      onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Nível</label>
                    <Input
                      type="number"
                      min="1"
                      value={skillForm.level}
                      onChange={(e) => setSkillForm({ ...skillForm, level: parseInt(e.target.value) })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={createSkillMutation.isPending || updateSkillMutation.isPending}
                    className="w-full"
                  >
                    {createSkillMutation.isPending || updateSkillMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : editingSkillId ? (
                      "Atualizar"
                    ) : (
                      "Criar"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {skills && skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-4 hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white">{skill.name}</h3>
                      <p className="text-yellow-100 text-sm">Nível {skill.level}</p>
                    </div>
                  </div>
                  {skill.description && (
                    <p className="text-yellow-50 text-sm">{skill.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Nenhuma habilidade criada ainda</p>
          )}
        </div>
      </div>
    </div>
  );
}
