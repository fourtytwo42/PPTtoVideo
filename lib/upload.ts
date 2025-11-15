import { IncomingMessage } from "http";
import formidable, { File } from "formidable";

export async function parseMultipart(req: IncomingMessage) {
  const form = formidable({ multiples: false });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export function assertFile(file: File | File[] | undefined): File {
  if (!file) throw new Error("File missing");
  return Array.isArray(file) ? file[0] : file;
}
