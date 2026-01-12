import { Request, Response } from 'express';
import { FileService } from '../services/file.service';
import { BadRequestError } from "../utils/error";

export class FileController {
  static async upload(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({message: 'File is required'});
    }
    const userId = req.user!.sub;
    const file = await FileService.upload(userId, req.file);

    res.status(201).json({
      id: file.id,
      name: file.originalName,
      size: file.size,
    });
  }

  static async download(req: Request, res: Response) {
    const fileId = req.params.id;
    const userId = req.user!.sub;

    const {file, absolutePath} =
      await FileService.getFileForDownload(fileId, userId);

    res.download(
      absolutePath,
      file.originalName,
      {
        headers: {
          'Content-Type': file.mimeType,
        },
      }
    );
  }

  static async list(req: Request, res: Response) {
    const userId = req.user!.sub;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const listSize = Math.min(
      Math.max(Number(req.query.list_size) || 10, 1),
      100
    );

    const result = await FileService.list(userId, page, listSize);

    res.json(result);
  }

  static async get(req: Request, res: Response) {
    const userId = req.user!.sub;
    const fileId = req.params.id;

    const file = await FileService.getById(userId, fileId);

    res.json(file);
  }

  static async delete(req: Request, res: Response) {
    await FileService.delete(
      req.params.id,
      req.user!.sub,
    );

    res.status(204).send();
  }

  static async update(req: Request, res: Response) {
    if (!req.file) {
      throw new BadRequestError('File is required');
    }

    const fileId = req.params.id;
    const userId = req.user!.sub;

    const file = await FileService.update(fileId, userId, req.file);

    res.json({
      id: file.id,
      name: file.originalName,
      size: file.size,
    });
  }
}
