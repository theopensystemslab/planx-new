import React, { useState } from "react";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Modal from "../../components/InformationalModal";
import {
  InformationalModal,
  Settings,
} from "../FlowEditor/components/Settings/model";
import { componentOutput, useStore } from "../FlowEditor/lib/store";
import Node from "./Node";

const Questions = () => {
  const [currentCard, record] = useStore((state) => [
    state.currentCard,
    state.record,
  ]);
  const node = currentCard();

  if (!node) return null;

  return (
    <Node
      node={node}
      key={node.id}
      handleSubmit={(values: componentOutput) => {
        record(node.id, values);
      }}
    />
  );
};

const Preview: React.FC<{
  theme?: any;
  embedded?: boolean;
  settings?: Settings;
}> = ({
  embedded = false,
  theme = {
    primary: "#2c2c2c",
  },
  settings,
}) => {
  const [record, previousCard] = useStore((state) => [
    state.record,
    state.previousCard(),
  ]);

  // TODO: replace with actual routing
  const [currentModal, setCurrentModal] = useState<
    InformationalModal | undefined
  >(undefined);
  const openModal = (type: "help" | "privacy") => {
    if (!settings) return;

    switch (type) {
      case "help":
        settings.design?.help && setCurrentModal(settings.design.help);
        break;
      case "privacy":
        settings.design?.privacy && setCurrentModal(settings.design.privacy);
        break;
      default:
        return;
    }
  };
  const closeModal = () => setCurrentModal(undefined);

  const leftFooterItems = [
    {
      title: "Privacy",
      href: "",
      onClick: () => openModal("privacy"),
    },
  ];

  const rightFooterItems = [
    {
      title: "Help",
      href: "",
      bold: true,
      onClick: () => openModal("help"),
    },
  ];

  return (
    <>
      {!embedded && (
        <Header bgcolor={theme.primary} logo={theme.logo} phaseBanner />
      )}
      <div
        style={{
          paddingTop: 40,
          display: "flex",
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          background: "#fff",
          position: "relative",
        }}
      >
        <span
          onClick={() => record(previousCard)}
          style={{
            padding: "0 10px 10px",
            visibility: previousCard ? "visible" : "hidden",
            pointerEvents: previousCard ? "auto" : "none",
            display: "block",
            cursor: "pointer",
            userSelect: "none",
            alignSelf: "start",
          }}
        >
          ⭠ Back
        </span>

        <Questions />

        {/* TODO: this shouldn't be here; will be routed properly */}
        {currentModal && (
          <Modal
            header={currentModal.header}
            content={currentModal.content}
            onClose={closeModal}
          />
        )}
      </div>
      {!embedded && (
        <Footer leftItems={leftFooterItems} rightItems={rightFooterItems} />
      )}
    </>
  );
};

export default Preview;
