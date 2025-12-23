import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";

export default function AdminPanel() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("games");
  const [gameForm, setGameForm] = useState({ name: "", description: "", genre: "" });
  const [characterForm, setCharacterForm] = useState({ gameId: 0, name: "", description: "", history: "" });
  const [attributeForm, setAttributeForm] = useState({ characterId: 0, name: "", value: 10, minValue: 0, maxValue: 15 });
  const [skillForm, setSkillForm] = useState({ characterId: 0, name: "", description: "", level: 1 });
  const [openGameDialog, setOpenGameDialog] = useState(false);
  const [openCharacterDialog, setOpenCharacterDialog] = useState(false);
  const [openAttributeDialog, setOpenAttributeDialog] = useState(false);
  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);

  // Verificar se é admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você não tem permissão para acessar o painel admin</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="mr-2" size={16} />
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: games } = trpc.games.list.useQuery();
  const { data: characters } = trpc.characters.listByGame.useQuery(
    { gameId: selectedGameId || 0 },
    { enabled: selectedGameId !== null }
  );
  const { data: attributes } = trpc.attributes.listByCharacter.useQuery(
    { characterId: selectedCharacterId || 0 },
    { enabled: selectedCharacterId !== null }
  );
  const { data: skills } = trpc.skills.listByCharacter.useQuery(
    { characterId: selectedCharacterId || 0 },
    { enabled: selectedCharacterId !== null }
  );

  const createGameMutation = trpc.games.create.useMutation({
    onSuccess: () => {
      toast.success("Jogo criado com sucesso!");
      setGameForm({ name: "", description: "", genre: "" });
      setOpenGameDialog(false);
    },
    onError: () => toast.error("Erro ao criar jogo"),
  });

  const createCharacterMutation = trpc.characters.create.useMutation({
    onSuccess: () => {
      toast.success("Personagem criado com sucesso!");
      setCharacterForm({ gameId: selectedGameId || 0, name: "", description: "", history: "" });
      setOpenCharacterDialog(false);
    },
    onError: () => toast.error("Erro ao criar personagem"),
  });

  const createAttributeMutation = trpc.attributes.create.useMutation({
    onSuccess: () => {
      toast.success("Atributo criado com sucesso!");
      setAttributeForm({ characterId: selectedCharacterId || 0, name: "", value: 10, minValue: 0, maxValue: 15 });
      setOpenAttributeDialog(false);
    },
    onError: () => toast.error("Erro ao criar atributo"),
  });

  const createSkillMutation = trpc.skills.create.useMutation({
    onSuccess: () => {
      toast.success("Habilidade criada com sucesso!");
      setSkillForm({ characterId: selectedCharacterId || 0, name: "", description: "", level: 1 });
      setOpenSkillDialog(false);
    },
    onError: () => toast.error("Erro ao criar habilidade"),
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="mr-2" size={16} />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie jogos, personagens, atributos e habilidades</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="games">Jogos</TabsTrigger>
            <TabsTrigger value="characters">Personagens</TabsTrigger>
            <TabsTrigger value="attributes">Atributos</TabsTrigger>
            <TabsTrigger value="skills">Habilidades</TabsTrigger>
          </TabsList>

          {/* GAMES TAB */}
          <TabsContent value="games" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Jogos RPG</h2>
              <Button onClick={() => setOpenGameDialog(true)} className="gap-2">
                <Plus size={16} />
                Novo Jogo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games?.map((game) => (
                <Card key={game.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{game.name}</CardTitle>
                    <CardDescription>{game.genre}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{game.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedGameId(game.id)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Dialog open={openGameDialog} onOpenChange={setOpenGameDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Jogo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome do jogo"
                    value={gameForm.name}
                    onChange={(e) => setGameForm({ ...gameForm, name: e.target.value })}
                  />
                  <Input
                    placeholder="Gênero"
                    value={gameForm.genre}
                    onChange={(e) => setGameForm({ ...gameForm, genre: e.target.value })}
                  />
                  <Textarea
                    placeholder="Descrição"
                    value={gameForm.description}
                    onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
                  />
                  <Button
                    onClick={() => createGameMutation.mutate(gameForm)}
                    disabled={createGameMutation.isPending}
                    className="w-full"
                  >
                    Criar Jogo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* CHARACTERS TAB */}
          <TabsContent value="characters" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Personagens</h2>
              {selectedGameId && (
                <Button onClick={() => setOpenCharacterDialog(true)} className="gap-2">
                  <Plus size={16} />
                  Novo Personagem
                </Button>
              )}
            </div>

            {!selectedGameId ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Selecione um jogo para gerenciar personagens</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters?.map((character) => (
                  <Card key={character.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{character.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{character.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedCharacterId(character.id)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Dialog open={openCharacterDialog} onOpenChange={setOpenCharacterDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Personagem</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome do personagem"
                    value={characterForm.name}
                    onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
                  />
                  <Textarea
                    placeholder="Descrição"
                    value={characterForm.description}
                    onChange={(e) => setCharacterForm({ ...characterForm, description: e.target.value })}
                  />
                  <Textarea
                    placeholder="História"
                    value={characterForm.history}
                    onChange={(e) => setCharacterForm({ ...characterForm, history: e.target.value })}
                  />
                  <Button
                    onClick={() =>
                      createCharacterMutation.mutate({
                        ...characterForm,
                        gameId: selectedGameId || 0,
                      })
                    }
                    disabled={createCharacterMutation.isPending}
                    className="w-full"
                  >
                    Criar Personagem
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ATTRIBUTES TAB */}
          <TabsContent value="attributes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Atributos</h2>
              {selectedCharacterId && (
                <Button onClick={() => setOpenAttributeDialog(true)} className="gap-2">
                  <Plus size={16} />
                  Novo Atributo
                </Button>
              )}
            </div>

            {!selectedCharacterId ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Selecione um personagem para gerenciar atributos</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {attributes?.map((attribute) => (
                  <Card key={attribute.id}>
                    <CardContent className="pt-6 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{attribute.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Valor: {attribute.value} (Min: {attribute.minValue}, Max: {attribute.maxValue})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 size={14} />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Dialog open={openAttributeDialog} onOpenChange={setOpenAttributeDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Atributo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome do atributo"
                    value={attributeForm.name}
                    onChange={(e) => setAttributeForm({ ...attributeForm, name: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Valor"
                    value={attributeForm.value}
                    onChange={(e) => setAttributeForm({ ...attributeForm, value: parseInt(e.target.value) })}
                  />
                  <Button
                    onClick={() =>
                      createAttributeMutation.mutate({
                        ...attributeForm,
                        characterId: selectedCharacterId || 0,
                      })
                    }
                    disabled={createAttributeMutation.isPending}
                    className="w-full"
                  >
                    Criar Atributo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* SKILLS TAB */}
          <TabsContent value="skills" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Habilidades</h2>
              {selectedCharacterId && (
                <Button onClick={() => setOpenSkillDialog(true)} className="gap-2">
                  <Plus size={16} />
                  Nova Habilidade
                </Button>
              )}
            </div>

            {!selectedCharacterId ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Selecione um personagem para gerenciar habilidades</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {skills?.map((skill) => (
                  <Card key={skill.id}>
                    <CardContent className="pt-6 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{skill.name}</p>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                        <p className="text-xs text-muted-foreground">Nível: {skill.level}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 size={14} />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Dialog open={openSkillDialog} onOpenChange={setOpenSkillDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Habilidade</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome da habilidade"
                    value={skillForm.name}
                    onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  />
                  <Textarea
                    placeholder="Descrição"
                    value={skillForm.description}
                    onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Nível"
                    value={skillForm.level}
                    onChange={(e) => setSkillForm({ ...skillForm, level: parseInt(e.target.value) })}
                  />
                  <Button
                    onClick={() =>
                      createSkillMutation.mutate({
                        ...skillForm,
                        characterId: selectedCharacterId || 0,
                      })
                    }
                    disabled={createSkillMutation.isPending}
                    className="w-full"
                  >
                    Criar Habilidade
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
