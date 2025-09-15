import { useState } from "react";
import { Settings, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ChatHeaderProps {
  onClearChat: () => void;
}

export function ChatHeader({ onClearChat }: ChatHeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const { toast } = useToast();

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    toast({
      description: "Modo de tema cambiado",
      variant: "default",
    });
  };

  const handleSettings = () => {
    toast({
      description: "Configuración abierta (funcionalidad pendiente)",
      variant: "default",
    });
  };

  return (
    <div className="bg-card rounded-t-xl shadow-lg border border-border" data-testid="chat-header">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <i className="fas fa-robot text-primary-foreground"></i>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent border-2 border-card rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground" data-testid="bot-name">Asistente IA</h3>
            <p className="text-xs text-muted-foreground" data-testid="bot-status">En línea</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSettings}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            data-testid="button-settings"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            data-testid="button-dark-mode"
          >
            {isDark ? 
              <Sun className="h-4 w-4 text-muted-foreground" /> : 
              <Moon className="h-4 w-4 text-muted-foreground" />
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
