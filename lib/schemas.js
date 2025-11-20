import { z } from "zod";

export const registerSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["user", "admin"]).default("user").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const bookSchema = z.object({
  judul: z.string().min(1, "Judul buku wajib diisi"),
  penulis: z.string().min(1, "Penulis wajib diisi"),
  tahun: z.coerce.number().int().min(1500).max(new Date().getFullYear() + 1),
});