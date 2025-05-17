'use client';
import React from 'react';
import Popup from './ui/popup';
import { MapView } from './map-view';
import { useHeader } from '../contexts/HeaderContext';
import Chat from './chat';

export default function PopupsContainer() {
  const { mapPopupOpen, chatPopupOpen, setMapPopupOpen, setChatPopupOpen } =
    useHeader();

  return (
    <>
      <Popup
        isOpen={mapPopupOpen}
        onClose={() => setMapPopupOpen(!mapPopupOpen)}
        title="Mapa"
      >
        <MapView />
      </Popup>

      <Popup
        isOpen={chatPopupOpen}
        onClose={() => setChatPopupOpen(!chatPopupOpen)}
        title="Chat"
        className="w-[30rem] h-[35rem]"
        customContentClasses="w-full h-[32.25rem] flex flex-col justify-end"
      >
        <Chat />
      </Popup>
    </>
  );
}
