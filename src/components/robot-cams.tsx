'use client';

import Container from '@/ui/container';
import { Robot3DViewer } from './robot-3d-viewer';
import { useEffect, useRef, useState } from 'react';
import { useRobotConnection } from '@/contexts/RobotConnectionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import RosCameraImg from './ros-camera-img';
import { Video } from 'lucide-react';
import { CameraType } from '@/types/CameraType';

export default function RobotCams() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sideCam, setSideCam] = useState<CameraType>('thermal');
  const [containerHeight, setContainerHeight] = useState(0);
  const camDivRef = useRef<HTMLDivElement>(null);
  const { connection } = useRobotConnection();
  const { t } = useLanguage();

  useEffect(() => {
    if (!containerRef.current) return;

    const updateHeight = () => {
      if (!containerRef.current) return;
      // Calculate dynamic height based on container's current size
      const newHeight = containerRef.current.clientHeight * 0.6; // Use 60% of container height for 3D viewer
      setContainerHeight(newHeight);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(containerRef.current);
    updateHeight(); // Initial calculation

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const _NotPluggedInPlaceholder = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gray-100 dark:bg-botbot-dark rounded-lg">
      <div className="flex flex-col items-center gap-1">
        <svg
          width="25"
          height="25"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 15a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-3a1 1 0 0 0-1-1ZM15 3a1 1 0 0 0 0 2h2.59l-5.3 5.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0L19 6.41V9a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1Z"
            fill="currentColor"
          />
        </svg>
        <span className="text-sm">{t('robotCams', 'nothingConnected')}</span>
      </div>
    </div>
  );

  return (
    <div id="container-ref" className="w-full h-full" ref={containerRef}>
      <Container
        className="w-full h-full"
        customContentClasses="w-full h-full flex flex-col"
      >
        <div className="flex flex-col gap-3 h-full overflow-hidden">
          {/* Cameras Section - Now on top */}
          <div className="w-full min-h-[180px] md:min-h-[200px] flex-[0.4]">
            <h3 className="heading-text mb-2 flex items-center">
              <Video className="mr-2 w-5 h-5" />
              {t('robotCams', 'live')}
              {connection.online && (
                <span className="ml-2 w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              )}
            </h3>
            {/* <SeparatorLine color="bg-gray-200 dark:bg-black" /> */}
            <div
              className="w-full flex flex-col sm:flex-row gap-3 h-[85%] mt-2"
              ref={camDivRef}
            >
              <div className="w-full sm:w-1/2 min-h-[140px]">
                <RosCameraImg cameraType="camera" />
              </div>
              <div className="w-full sm:w-1/2 min-h-[140px]">
                {connection.online && (
                  <select
                    className="absolute right-4 z-50 m-2 bg-white dark:bg-botbot-dark text-gray-700 dark:text-white text-sm rounded-lg px-2 py-1 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-botbot-purple"
                    onChange={(e) => setSideCam(e.target.value as CameraType)}
                    value={sideCam}
                  >
                    <option value="thermal">{t('robotCams', 'thermal')}</option>
                    <option value="rgb">{t('robotCams', 'rgb')}</option>
                  </select>
                )}
                <RosCameraImg
                  key={sideCam}
                  cameraType={sideCam}
                  offlineMsg={t('robotOffline', 'noPayload')}
                />
                {/* <NotPluggedInPlaceholder /> */}
              </div>
            </div>
          </div>

          {/* 3D Viewer Section - Now at the bottom */}
          <div className="w-full flex-[0.6] min-h-[300px] dark:bg-botbot-dark rounded-lg overflow-hidden">
            <div className="w-full h-full">
              {containerHeight > 0 && (
                <Robot3DViewer canvasInitialHeight={containerHeight} />
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
