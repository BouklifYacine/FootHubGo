import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  
  interface RoleSelectProps {
    RoleActuel: "Admin" | "utilisateur";
    isLoading: boolean;
    onRoleChange: (newRole: "Admin" | "utilisateur") => void;
  }
  
  export const RoleSelect = ({ RoleActuel, isLoading, onRoleChange }: RoleSelectProps) => {
    return (
      <Select
        value={RoleActuel}
        onValueChange={onRoleChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[140px] ml-4">
          <SelectValue>
            {isLoading ? (
              <div className="flex items-center">
                <span className="ml-2">Modification...</span>
              </div>
            ) : (
                RoleActuel
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Roles</SelectLabel>
            <SelectItem value="Admin">Administrateur</SelectItem>
            <SelectItem value="utilisateur">Utilisateur</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  };