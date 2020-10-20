import React, { createContext, useCallback, useState } from 'react';
import api from '../services/api';

interface AuthState {
  token: string;
  // Sem mostrar todas as proriedades
  user: object;
}
interface SignInCredentials {
  email: string;
  password: string;
}
interface AuthContextData {
  user: object;
  // transforma o método em async ele está obrigariamente retornando uma promise
  signIn(credentials: SignInCredentials): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// componente para ser importado como contexto
const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    // inicializa a variavel com a função, busca basados nos dado do LS
    // preenche o estado com o token do usuário ou vazio
    const token = localStorage.getItem('@GoBarber:token');
    const user = localStorage.getItem('@GoBarber:user');

    // se existe a informação de token e usuario retorna a informação
    // parse transforma de volta s tring em um objeto
    if (token && user) {
      return { token, user: JSON.parse(user) };
    }
    // forçar a tipagem do objeto
    return {} as AuthState;
  });

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem('@GoBarber:token', token);
    localStorage.setItem('@GoBarber:user', JSON.stringify(user));

    // logo após login preenche o estado com as informações
    // enquanto o app estiver funcionando
    setData({ token, user });
  }, []);

  return (
    <AuthContext.Provider value={{ user: data.user, signIn }}>
      {/* tudo o que o context provider recebe como filho irá estar repassando */}
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };