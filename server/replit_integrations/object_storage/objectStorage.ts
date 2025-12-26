import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  setObjectAclPolicy,
} from "./objectAcl";

// Standard Google Cloud Storage client initialization.
// This will use Application Default Credentials (ADC) or the 
// GOOGLE_APPLICATION_CREDENTIALS environment variable.
export const objectStorageClient = new Storage();

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() { }

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    return dir;
  }

  getBucketName(): string {
    const bucket = process.env.GCS_BUCKET_NAME;
    if (!bucket) {
      throw new Error("GCS_BUCKET_NAME environment variable is not set");
    }
    return bucket;
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName || this.getBucketName());
      const file = bucket.file(objectName);

      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }

  async downloadObject(file: File, res: Response, cacheTtlSec: number = 3600) {
    try {
      const [metadata] = await file.getMetadata();
      const isPublic = metadata.cacheControl?.includes("public");

      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `${isPublic ? "public" : "private"
          }, max-age=${cacheTtlSec}`,
      });

      const stream = file.createReadStream();

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const bucketName = this.getBucketName();
    const objectId = randomUUID();
    const privateDir = this.getPrivateObjectDir();
    const objectName = privateDir ? `${privateDir}/uploads/${objectId}` : `uploads/${objectId}`;

    const [url] = await objectStorageClient
      .bucket(bucketName)
      .file(objectName)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: 'application/octet-stream',
      });

    return url;
  }

  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const entityId = objectPath.slice("/objects/".length);
    const privateDir = this.getPrivateObjectDir();
    const objectName = privateDir ? `${privateDir}/${entityId}` : entityId;

    const bucket = objectStorageClient.bucket(this.getBucketName());
    const objectFile = bucket.file(objectName);

    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    try {
      const url = new URL(rawPath);
      const pathname = url.pathname;
      const bucketName = this.getBucketName();

      // Standard GCS URL path is /bucket-name/object-name
      let objectName = pathname;
      if (pathname.startsWith(`/${bucketName}/`)) {
        objectName = pathname.slice(bucketName.length + 2);
      }

      const privateDir = this.getPrivateObjectDir();
      if (privateDir && objectName.startsWith(`${privateDir}/`)) {
        objectName = objectName.slice(privateDir.length + 1);
      }

      return `/objects/${objectName}`;
    } catch (e) {
      return rawPath;
    }
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: File;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

function parseObjectPath(path: string): {
  bucketName: string | null;
  objectName: string;
} {
  if (path.startsWith("/")) {
    path = path.slice(1);
  }
  const parts = path.split("/");
  if (parts.length < 2) {
    return { bucketName: null, objectName: path };
  }
  return {
    bucketName: parts[0],
    objectName: parts.slice(1).join("/"),
  };
}

