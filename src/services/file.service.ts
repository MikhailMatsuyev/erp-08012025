import { prisma } from '../db/prisma';
import path from 'path';
import { FileSystemError, ForbiddenError, NotFoundError } from "../utils/error";
import fs from "fs";
import fsp from "fs/promises";
import { safeUnlink } from "../utils/filesystem";

export class FileService {
  static async upload(userId: string, file: Express.Multer.File) {
    const extension = path.extname(file.originalname).slice(1);

    const record = await prisma.file.create({
      data: {
        userId,
        originalName: file.originalname,
        extension,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
      },
    });

    return record;
  }
  static async getFileForDownload(fileId: string, userId: string) {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundError('File not found');
    }

    if (file.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    const absolutePath = path.resolve(file.path);

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundError('File missing on disk');
    }

    return {
      file,
      absolutePath,
    };
  }
  static async list(
    userId: string,
    page: number,
    listSize: number
  ) {
    const skip = (page - 1) * listSize;

    const [items, total] = await Promise.all([
      prisma.file.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: listSize,
        select: {
          id: true,
          originalName: true,
          extension: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
      }),
      prisma.file.count({
        where: { userId },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        listSize,
        pages: Math.ceil(total / listSize),
      },
    };
  }
  static async getById(userId: string, fileId: string) {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
      select: {
        id: true,
        originalName: true,
        extension: true,
        mimeType: true,
        size: true,
        path: true,
        createdAt: true,
      },
    });

    if (!file) {
      throw new NotFoundError('File not found');
    }

    return file;
  }
  static async delete(fileId: string, userId: string) {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundError('File not found');
    }

    if (file.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    // удаляем файл с диска
    try {
      await fsp.unlink(file.path);
    } catch (err: any) {
      // файл может уже отсутствовать — это НЕ ошибка для пользователя
      if (err.code === 'ENOENT') {
        // файл уже удалён — это ОК
        return;
      }

      throw new FileSystemError('Failed to delete file from storage');
    }

    // удаляем запись из БД
    await prisma.file.delete({
      where: { id: fileId },
    });
  }
  static async update(
    fileId: string,
    userId: string,
    newFile: Express.Multer.File,
  ) {
    const existing = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundError('File not found');
    }

    const oldPath = existing.path;
    const newPath = newFile.path;

    try {
      // обновляем БД
      const updated = await prisma.file.update({
        where: { id: fileId },
        data: {
          originalName: newFile.originalname,
          extension: path.extname(newFile.originalname).slice(1),
          mimeType: newFile.mimetype,
          size: newFile.size,
          path: newPath,
        },
      });

      // удаляем старый файл
      await safeUnlink(oldPath);

      return updated;
    } catch (err) {
      // 🔥 rollback: если БД упала — удалить новый файл
      await safeUnlink(newPath);
      throw err;
    }
  }
}
