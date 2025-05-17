import { signOut } from 'next-auth/react';

const logout = async () => {
  // Ao chamar signOut, o NextAuth irá limpar o cookie da sessão.
  // Você pode configurar a URL de redirecionamento após o logout com callbackUrl.
  await signOut({ redirect: true, callbackUrl: '/' });
};

export default logout;
