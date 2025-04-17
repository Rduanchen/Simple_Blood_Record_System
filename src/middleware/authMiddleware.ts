import { type Request, type Response, type NextFunction } from 'express';
import { verifyFirebaseToken, decodeCustomToken } from '../utils/tokenUtils';

// Define authenticated request interface
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

// Authentication middleware
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const firebaseToken = req.headers['firebase-token'] as string;
    const customToken = req.headers['custom-token'] as string;

    if (firebaseToken === undefined || customToken === undefined) {
      res.status(401).json({ error: 'Authentication tokens missing' });
      return undefined;
    }

    // Verify tokens
    const decodedFirebaseToken = verifyFirebaseToken(firebaseToken);
    const decodedCustomToken = decodeCustomToken(customToken);

    if (decodedFirebaseToken === undefined || decodedCustomToken === undefined) {
      res.status(401).json({ error: 'Authentication failed' });
      return undefined;
    }

    // Auth each parameter exists
    if (decodedFirebaseToken.uid === undefined || decodedCustomToken.id === undefined) {
      res.status(401).json({ error: 'Authentication failed' });
      return undefined;
    }
    if (decodedCustomToken.username === undefined) {
      res.status(401).json({ error: 'Authentication failed' });
      return undefined;
    }

    // Set user information in request object
    req.user = {
      id: String(decodedFirebaseToken.uid),
      username: String(decodedCustomToken.username),
    };

    next();
  } catch (error: any) {
    res.status(401).json({ error: 'Authentication failed', details: error.message });
  }
};
