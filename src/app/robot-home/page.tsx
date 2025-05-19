import ChatContainer from '@/components/chat-container';
import MapsAndCams from '@/components/robot-cams';
// import PopupsContainer from '@/components/popups-container';
import RobotControls from '@/components/robot-controls';
import RobotData from '@/components/robot-data';
import { Sidebar } from '@/components/sidebar';

export default async function RobotHome() {
  return (
    <>
      <div className="w-full h-[calc(100vh-70px)] flex flex-col md:flex-row items-stretch justify-between relative px-1 overflow-hidden">
        {/* Mobile: Last, Desktop: Left column (30%) - data + chat (swapped) */}
        <div className="flex flex-col gap-2 w-full md:w-[30%] px-1 pt-4 order-2 md:order-1 h-auto md:h-full pb-1">
          <div className="flex-1/2 overflow-auto min-h-0">
            <RobotData />
          </div>
          <div className="flex-1 min-h-0">
            <ChatContainer />
          </div>
        </div>

        {/* Mobile: First, Desktop: Middle column (60%) - 3D viz + cams */}
        <div className="w-full pt-4 md:w-[57%] flex flex-col justify-center order-1 md:order-2 h-auto md:h-full overflow-auto pb-1 px-1">
          <div className="w-full h-full overflow-auto">
            <MapsAndCams />
          </div>
        </div>

        {/* Desktop: Right column (10%) - controls */}
        <div className="w-full h-[calc(100vh-70px)] md:w-[12%] order-3 pb-1 px-1 pt-4 flex flex-col pr-4 md:pr-4">
          <div className="w-full h-full">
            <RobotControls />
          </div>
        </div>

        {/* Sidebar - positioned at the edge of the screen */}
        <div className="absolute right-0 h-[calc(100vh-56px)] z-10">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
