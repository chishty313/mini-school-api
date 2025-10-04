import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Dynamic import to handle potential issues
    const { default: app } = await import('../src/app');
    return app(req, res);
  } catch (error) {
    console.error('Error importing app:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to start application',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};