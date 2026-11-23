import ContractType from "./ContractType";
import GuidanceOnly from "./GuidanceOnly";
import MultipleStripeAccounts from "./MultipleStripeAccounts";
import TeamCategory from "./TeamCategory";
import TrialAccount from "./TrialAccount";

const AdvancedSettings: React.FC = () => (
  <>
    <TeamCategory />
    <ContractType />
    <TrialAccount />
    <GuidanceOnly />
    <MultipleStripeAccounts />
  </>
);

export default AdvancedSettings;
