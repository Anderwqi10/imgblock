import React, { useContext, useEffect, useState } from "react";

import LumangiLogo from "../assets/images/LumangiLogo.svg";
import RewardWheel from "../assets/images/RewardWheel.svg";

import Button from "../UI/Button";
import { useWeb3React } from "@web3-react/core";
import ConnectWallet from "./auth/ConnectWallet";
import { AuthContext, ActionTypes } from "../contexts/AuthContext";
// const style = {
//   position: "absolute" as "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   // width: 400,
//   p: 4,
// };

export function Header() {
  const { updateAuthAction, isAuthenticated } = useContext(AuthContext);
  const { account } = useWeb3React();

  const handleLogin = () => {
    updateAuthAction(ActionTypes.Login);
  }; //TODO
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [selectedWallet, setSelectedWallet] = useState<
    "MetaMask" | "WalletConnect" | "Coinbase" | null
  >(null);
  useEffect(() => {
    if (account && selectedWallet) {
      setIsAuthModalOpen(false);
    }
  }, [account, selectedWallet]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between w-full px-4 sm:px-8 md:px-12 lg:px-20 mt-5 mb-6 sm:mb-10 gap-4 sm:gap-0">
        <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start order-2 sm:order-1">
          <div
            className="rounded-lg w-full sm:w-auto"
            style={{
              background: "linear-gradient(135deg, #414593 0%, #00022E 100%)",
              backgroundBlendMode: "hard-light",
            }}
          >
            {isAuthenticated && (
              <div className="flex h-full px-2 sm:px-4 py-1">
                <img src={RewardWheel} alt="RewardWheel" className="w-8 h-8 sm:w-auto sm:h-auto" />

                <div className="self-end mx-1 sm:mx-2 text-sm sm:text-xl text-white">
                  Bright Mba
                </div>
                <div className="px-1 text-xs text-white bg-[#5856D6] rounded-full h-fit">
                  Beginner
                </div>
              </div>
            )}
            <div className="w-full h-1 rounded-full bg-neutral-200 dark:bg-neutral-600">
              <div
                className="h-1 bg-[#FF073A] rounded-full "
                style={{ width: "45%" }}
              ></div>
            </div>
          </div>
          {isAuthenticated && (
            <div className="hidden sm:flex items-center justify-end px-2 py-1 ml-4 sm:ml-8 lg:ml-40 bg-white rounded-lg h-fit">
              <img src={RewardWheel} alt="RewardWheel" className="w-8 h-8 sm:w-10 sm:h-10" />
              <div className="flex flex-col w-full text-xs">
                <div>Next Roll:</div>
                <div>8h 13m 22s</div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center self-center justify-self-center order-1 sm:order-2">
          <a className="w-full h-full" href="/">
            <img
              src={LumangiLogo}
              alt="logo"
              className="max-w-full ml-0 sm:ml-4 w-40 sm:w-48 md:w-60"
            />
          </a>
        </div>
        <div className="flex self-center justify-center sm:justify-end space-x-2 sm:space-x-4 justify-self-end order-3 w-full sm:w-auto">
          {!isAuthenticated && (
            <Button
              color="default"
              onClick={handleLogin}
              label="Register/Login"
              customStyle="!text-white border-white border border-opacity-50 text-sm sm:text-base"
              title="Coming Soon!!"
            />
          )}
          <Button
            onClick={() => setIsAuthModalOpen(true)}
            label={!!account ? account : "Connect Wallet"}
            color="dangerText"
            disabled={!!account}
            customStyle="w-32 sm:w-40 text-ellipsis overflow-hidden whitespace-nowrap text-sm sm:text-base"
            title={account ? account : ""}
          />
          <ConnectWallet
            isModalOpen={isAuthModalOpen}
            setIsModalOpen={setIsAuthModalOpen}
            setSelectedWallet={setSelectedWallet}
          />
        </div>
      </div>
    </>
  );
}

export default Header;
