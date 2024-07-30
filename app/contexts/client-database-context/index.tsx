import { createContext, useContext, useEffect, useState } from "react";

import { ClientDatabase } from "~/lib/client-database";

interface ClientDatabaseContextType {
  database: ClientDatabase | null;
}

export const ClientDatabaseContext = createContext<ClientDatabaseContextType>({
  database: null,
});

export const ClientDatabaseContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [database, setDatabase] = useState<ClientDatabase | null>(null);

  useEffect(() => {
    const setupDatabase = async () => {
      const initDB = new ClientDatabase();
      await initDB.initialize();
      setDatabase(initDB);
    };
    setupDatabase();
  }, []);

  if (!database) return null;

  return (
    <ClientDatabaseContext.Provider
      value={{
        database,
      }}
    >
      {children}
    </ClientDatabaseContext.Provider>
  );
};

export const useClientDatabaseContext = (): ClientDatabaseContextType => {
  return useContext(ClientDatabaseContext);
};
