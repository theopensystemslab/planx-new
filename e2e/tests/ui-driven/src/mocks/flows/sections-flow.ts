import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";

export const flow: FlowGraph = {
  _root: {
    edges: [
      "Section1",
      "Question1",
      "Section2",
      "Question2",
      "EndOfSection2Content",
      "Section3",
      "PreSendContent",
      "Send",
      "Confirmation",
    ],
  },
  ChecklistOptionC: {
    data: { text: "C" },
    type: ComponentType.Answer,
    edges: ["ContentC"],
  },
  Question1: {
    data: { text: "Question 1" },
    type: ComponentType.Question,
    edges: ["Question1AnswerA", "Question1AnswerB", "Question1AnswerC"],
  },
  Section2: { data: { title: "Section Two" }, type: ComponentType.Section },
  Question1AnswerB: { data: { text: "B" }, type: ComponentType.Answer },
  ContentC: {
    data: {
      title: "Reached C",
      color: "#EFEFEF",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
  PreSendContent: {
    data: { title: "About to send" },
    type: ComponentType.Content,
  },
  Question1AnswerC: { data: { text: "C" }, type: ComponentType.Answer },
  ContentB: {
    data: {
      title: "Reached B",
      color: "#EFEFEF",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
  Send: {
    data: { title: "Send", destinations: ["email"] },
    type: ComponentType.Send,
  },
  ContentD: {
    data: {
      title: "Reached D",
      color: "#EFEFEF",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
  ContentA: {
    data: {
      title: "Reached A",
      color: "#EFEFEF",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
  ChecklistOptionB: {
    data: { text: "B" },
    type: ComponentType.Answer,
    edges: ["ContentB"],
  },
  Checklist1: {
    data: { text: "Multi-select", allRequired: false },
    type: ComponentType.Checklist,
    edges: [
      "ChecklistOptionA",
      "ChecklistOptionB",
      "ChecklistOptionC",
      "ChecklistOptionD",
    ],
  },
  Question2AnswerA: { data: { text: "A" }, type: ComponentType.Answer },
  ChecklistOptionD: {
    data: { text: "D" },
    type: ComponentType.Answer,
    edges: ["ContentD"],
  },
  Section1: { data: { title: "Section One" }, type: ComponentType.Section },
  Question2: {
    data: { text: "Question 2" },
    type: ComponentType.Question,
    edges: ["Question2AnswerA", "Question2AnswerB"],
  },
  Question1AnswerA: { data: { text: "A" }, type: ComponentType.Answer },
  Question2AnswerB: {
    data: { text: "B" },
    type: ComponentType.Answer,
    edges: ["Checklist1"],
  },
  ChecklistOptionA: {
    data: { text: "A" },
    type: ComponentType.Answer,
    edges: ["ContentA"],
  },
  Section3: { data: { title: "Section Three" }, type: ComponentType.Section },
  Confirmation: {
    data: {
      heading: "Form sent",
      moreInfo: "<h2>You will be contacted</h2>",
      contactInfo: "You can contact us at <em>planning@abc.gov.uk</em>",
    },
    type: ComponentType.Confirmation,
  },
  EndOfSection2Content: {
    data: {
      title: "Reached the end of section two",
      color: "#EFEFEF",
      resetButton: false,
    },
    type: ComponentType.Content,
  },
};

export const updatedQuestionAnswers = {
  Question1AnswerA: { data: { text: "Aaa" }, type: ComponentType.Answer },
  Question1AnswerB: { data: { text: "Bee" }, type: ComponentType.Answer },
  Question1AnswerC: { data: { text: "Cee" }, type: ComponentType.Answer },
};
