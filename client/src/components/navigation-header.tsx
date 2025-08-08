import { Button } from "@/components/ui/button";
import { Brain, UserCheck } from "lucide-react";

interface NavigationHeaderProps {
  isAdminView: boolean;
  onToggleView: () => void;
}

export function NavigationHeader({ isAdminView, onToggleView }: NavigationHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
              <img
                src="/Crown_Blue.png"
                alt="Columbia Crown Logo"
                className="h-6 w-auto mr-2"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Columbia Neurosurgery Department</h1>
              <p className="text-sm text-gray-500">AI Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onToggleView}
              className="flex items-center space-x-2 text-sm font-medium"
            >
              <UserCheck size={16} />
              <span>{isAdminView ? "Chat View" : "Admin View"}</span>
            </Button>
            
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI Assistant Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
