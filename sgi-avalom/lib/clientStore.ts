import { create } from "zustand";
import { Cliente } from "./types";

interface ClientState {
  clients: Cliente[];
  setClients: (clients: Cliente[]) => void;
  addClient: (client: Cliente) => void;
  updateClient: (client: Cliente) => void;
  removeClient: (cli_id: number) => void;
}

const useClientStore = create<ClientState>((set) => ({
  clients: [],
  setClients: (clients) => set({ clients }),
  addClient: (client) =>
    set((state) => ({ clients: [...state.clients, client] })),
  updateClient: (updatedClient) =>
    set((state) => ({
      clients: state.clients.map((client) =>
        client.cli_id === updatedClient.cli_id ? updatedClient : client
      ),
    })),
  removeClient: (cli_id) =>
    set((state) => ({
      clients: state.clients.filter((client) => client.cli_id !== cli_id),
    })),
}));

export default useClientStore;
