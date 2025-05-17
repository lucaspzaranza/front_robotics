'use client';

import { useRobotConnection } from '@/contexts/RobotConnectionContext';
import useRobotCamera from '@/hooks/ros/useRobotCamera';
import { useEffect, useRef, useState } from 'react';
import RobotOffline from './robot-offline';
import { Loader } from 'lucide-react';
import { CameraType } from '@/types/CameraType';
import { useLanguage } from '@/contexts/LanguageContext';

// Simple throttle function
function throttle<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let lastCall = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}

export default function RosCameraImg({
  width,
  height,
  topicName,
  cameraType,
  offlineMsg,
}: {
  width?: number;
  height?: number;
  topicName?: string;
  cameraType: CameraType;
  offlineMsg?: string;
}) {
  const [content, setContent] = useState<React.ReactNode | undefined>(
    undefined
  );
  //
  const image = useRobotCamera(false, cameraType, topicName);

  const latestImageRef = useRef(image);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { connection } = useRobotConnection();
  const canvasSetSize = useRef(false);
  const { t } = useLanguage();

  // Cache of last image string
  const lastImageDataRef = useRef<string | null>(null);
  // Ref for throttled canvas update function
  const throttledUpdateCanvasRef = useRef<() => void>(() => {});

  useEffect(() => {
    latestImageRef.current = image;
  }, [image]);

  // Create throttled function only once
  useEffect(() => {
    throttledUpdateCanvasRef.current = throttle(async () => {
      const currentImage = latestImageRef.current;
      if (!currentImage.data || currentImage.data.trim() === '') {
        return;
      }
      if (!canvasRef.current) return;

      try {
        const canvas = canvasRef.current;
        // If OffscreenCanvas is available, use it to draw the image
        if (typeof OffscreenCanvas !== 'undefined') {
          const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
          const bitmap = await createBitmapFromJPEG(currentImage.data);
          if (!canvasSetSize.current) {
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            canvasSetSize.current = true;
          }
          const offCtx = offscreen.getContext('2d', {
            willReadFrequently: true,
          });
          if (offCtx) {
            offCtx.drawImage(bitmap, 0, 0);
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(offscreen, 0, 0);
            }
          }
        } else {
          const bitmap = await createBitmapFromJPEG(currentImage.data);
          if (!canvasSetSize.current) {
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            canvasSetSize.current = true;
          }
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(bitmap, 0, 0);
          }
        }
      } catch (error) {
        console.error('Error processing JPEG image:', error);
      }
    }, 25);
  }, []);

  // Update canvas only if the image changed and using throttledUpdateCanvas
  useEffect(() => {
    if (
      canvasRef.current &&
      image !== undefined &&
      image.format === 'jpeg' &&
      image.data &&
      image.data.trim() !== ''
    ) {
      // If the image string is the same as the last one, don't update
      if (lastImageDataRef.current === image.data) {
        return;
      }
      lastImageDataRef.current = image.data;
      throttledUpdateCanvasRef.current();
    }
  }, [image, width, height, cameraType]);

  useEffect(() => {
    if (image === undefined || image.format !== 'jpeg') {
      setContent(
        <span className="w-full h-full border-2 border-gray-200 dark:border-black rounded-lg flex flex-col items-center justify-center text-center">
          <Loader className="w-5 h-5 animate-spin" />
          {t('robotCams', 'initializingCamera')}
        </span>
      );
    } else {
      setContent(
        <canvas
          className="absolute rounded-lg border-2 border-gray-200 dark:border-black"
          style={{ width: `100%`, height: `100%` }}
          ref={canvasRef}
        />
      );
    }
  }, [image]);

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center rounded-lg">
      {connection.online && content}
      {!connection.online && <RobotOffline msg={offlineMsg} useBorder />}
    </div>
  );
}

async function createBitmapFromJPEG(jpegString: string): Promise<ImageBitmap> {
  // Make sure the string is in dataURL format
  const dataUrl = jpegString.startsWith('data:image/jpeg;base64,')
    ? jpegString
    : 'data:image/jpeg;base64,' + jpegString;

  // Convert dataURL to Blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  // Create and return ImageBitmap
  return await createImageBitmap(blob);
}
