use ethers_core::types::Address;

use super::{Alchemy, Result};
use crate::types::{ChecksummedAddress, GlobalState};

/// call to fetch balances
#[tauri::command]
pub async fn alchemy_fetch_erc20_balances(
    chain_id: u32,
    address: ChecksummedAddress,
) -> Result<()> {
    Alchemy::read()
        .await
        .fetch_balances(chain_id, address)
        .await
}

/// call to fetch native balance
#[tauri::command]
pub async fn alchemy_fetch_native_balance(chain_id: u32, address: Address) -> Result<()> {
    Alchemy::read()
        .await
        .fetch_native_balance(chain_id, address)
        .await
}

#[tauri::command]
pub async fn alchemy_fetch_transactions(chain_id: u32, address: Address) -> Result<()> {
    Alchemy::read()
        .await
        .fetch_transactions(chain_id, address)
        .await
}
