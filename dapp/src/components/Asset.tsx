import * as React from "react";
import styled from "styled-components";

import Icon from "./Icon";

import { AssetData, fromWad } from "../helpers";

import { getChainMetadata } from "../chains";

const kadenaLogo = getChainMetadata("kadena:testnet04").logo;

const SAsset = styled.div`
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
`;
const SAssetLeft = styled.div`
  display: flex;
`;

const SAssetName = styled.div`
  display: flex;
  margin-left: 10px;
`;

const SAssetRight = styled.div`
  display: flex;
`;

const SAssetBalance = styled.div`
  display: flex;
`;

interface AssetProps {
  asset: AssetData;
}

const Asset = (props: AssetProps) => {
  const { asset } = props;
  const decimals = asset.name === "KDA" ? 12 : undefined;
  return (
    <SAsset {...props}>
      <SAssetLeft>
        <Icon src={kadenaLogo} />
        <SAssetName>{asset.name}</SAssetName>
      </SAssetLeft>
      <SAssetRight>
        <SAssetBalance>
          {fromWad(asset.balance || "0", decimals)} {asset.symbol}
        </SAssetBalance>
      </SAssetRight>
    </SAsset>
  );
};

export default Asset;
