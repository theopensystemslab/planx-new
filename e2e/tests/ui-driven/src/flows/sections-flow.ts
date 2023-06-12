import { ComponentType } from "@opensystemslab/planx-core/types";
import type { FlowGraph } from "@opensystemslab/planx-core/types";

export const flow: FlowGraph = {
  _root: {
    edges: [
      "Section1",
      "Question1",
      "Section2",
      "Question2",
      "EndOfSection2Notice",
      "Section3",
      "PreSendContent",
      "Send",
      "Confirmation",
    ],
  },
  ChecklistOptionC: {
    data: { text: "C" },
    type: ComponentType.Answer,
    edges: ["NoticeC"],
  },
  Question1: {
    data: { text: "Question 1" },
    type: ComponentType.Question,
    edges: ["Question1AnswerA", "Question1AnswerB", "Question1AnswerC"],
  },
  Section2: { data: { title: "Section Two" }, type: ComponentType.Section },
  Question1AnswerB: { data: { text: "B" }, type: ComponentType.Answer },
  NoticeC: {
    data: { color: "#EFEFEF", title: "Reached C", resetButton: false },
    type: ComponentType.Notice,
  },
  PreSendContent: {
    data: { content: "<p>About to send</p>" },
    type: ComponentType.Content,
  },
  Question1AnswerC: { data: { text: "C" }, type: ComponentType.Answer },
  NoticeB: {
    data: { color: "#EFEFEF", title: "Reached B", resetButton: false },
    type: ComponentType.Notice,
  },
  Send: {
    data: { title: "Send", destinations: ["email"] },
    type: ComponentType.Send,
  },
  NoticeD: {
    data: { color: "#EFEFEF", title: "Reached D", resetButton: false },
    type: ComponentType.Notice,
  },
  NoticeA: {
    data: { color: "#EFEFEF", title: "Reached A", resetButton: false },
    type: ComponentType.Notice,
  },
  ChecklistOptionB: {
    data: { text: "B" },
    type: ComponentType.Answer,
    edges: ["NoticeB"],
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
    edges: ["NoticeD"],
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
    edges: ["NoticeA"],
  },
  Section3: { data: { title: "Section Three" }, type: ComponentType.Section },
  Confirmation: {
    data: {
      heading: "Application sent",
      moreInfo: "<h2>You will be contacted</h2>",
      contactInfo: "You can contact us at <em>planning@abc.gov.uk</em>",
    },
    type: ComponentType.Confirmation,
  },
  EndOfSection2Notice: {
    data: {
      color: "#EFEFEF",
      title: "Reached the end of section two",
      resetButton: false,
    },
    type: ComponentType.Notice,
  },
};

export const updatedQuestionAnswers = {
  Question1AnswerA: { data: { text: "Aaa" }, type: ComponentType.Answer },
  Question1AnswerB: { data: { text: "Bee" }, type: ComponentType.Answer },
  Question1AnswerC: { data: { text: "Cee" }, type: ComponentType.Answer },
};
