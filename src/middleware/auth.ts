import { Request, Response, NextFunction } from 'express';
import { decodeJwtToken } from '../services/userService';
import { getFirebaseAuth } from '../config/firebase';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userName?: string;
      firebaseUid?: string;
    }
  }
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (authHeader === undefined) {
    res.status(401).json({ message: 'Authorization header is missing' });
    return;
  }
  
  const tokenParts = authHeader.split(' ');
  
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    res.status(401).json({ message: 'Invalid authorization format' });
    return;
  }
  
  const token = tokenParts[1];
  
  const decoded = decodeJwtToken(token);
  
  if (decoded === null) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
  
  req.userId = decoded.id;
  req.userName = decoded.name;
  
  next();
};

export const authenticateFirebase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['firebase-authorization'];
  
  if (authHeader === undefined) {
    res.status(401).json({ message: 'Firebase authorization header is missing' });
    return;
  }
  
  const tokenParts = String(authHeader).split(' ');
  
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    res.status(401).json({ message: 'Invalid firebase authorization format' });
    return;
  }
  
  const token = tokenParts[1];
  
  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    req.firebaseUid = decodedToken.uid;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired firebase token' });
  }
};