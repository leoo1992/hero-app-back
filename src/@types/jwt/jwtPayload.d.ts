export type JwtPayload = {
  sub: number;
  email: string;
  nome: string;
  acesso: AcessoType;
  iat: number;
  exp: number;
};