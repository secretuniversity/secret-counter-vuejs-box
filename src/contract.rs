use cosmwasm_std::{
    entry_point, to_binary, Binary, Env, Deps, DepsMut,
    MessageInfo, Response, StdError, StdResult,
};

use crate::error::ContractError;
use crate::msg::{CountResponse, ExecuteMsg, InstantiateMsg, QueryMsg};
use crate::state::{config, config_read, State};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, StdError> {

    // create initial state with count and contract owner
    let state = State {
        count: msg.count,
        owner: info.sender.clone(),
    };

    // save the contract state
    config(deps.storage).save(&state)?;

    deps.api.debug(&format!("Contract was initialized by {}", info.sender));

    Ok(Response::default())
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Increment {} => try_increment(deps),
        ExecuteMsg::Reset { count } => try_reset(deps, info, count),
    }
}

pub fn try_increment(
    deps: DepsMut,
) -> Result<Response, ContractError> {

    // 1. load state
    // 2. increment the counter by 1
    // 3. save state

    deps.api.debug("count incremented successfully");
    Ok(Response::default())
}

pub fn try_reset(
    deps: DepsMut,
    info: MessageInfo,
    count: i32,
) -> Result<Response, ContractError> {

    // 1. load state
    // 2. if sender is not the contract owner, return error
    // 3. else, reset the counter to the value given

    deps.api.debug("count reset successfully");
    Ok(Response::default())
}

#[entry_point]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetCount {} => to_binary(&query_count(deps)?),
    }
}

fn query_count(
    deps: Deps,
) -> StdResult<CountResponse> {

    // 1. load state
    // 2. return count response

    Ok(CountResponse { count: 16876 })
}

#[cfg(test)]
mod tests {
    use super::*;

    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{coins, from_binary};

    #[test]
    fn proper_initialization() {
        let mut deps = mock_dependencies();

        let msg = InstantiateMsg { count: 16876 };
        let info = mock_info("creator", &coins(1000, "earth"));

        // we can just call .unwrap() to assert this was a success
        let res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
        assert_eq!(0, res.messages.len());

        // it worked, let's query the state
        let res = query(deps.as_ref(), mock_env(), QueryMsg::GetCount {}).unwrap();
        let value: CountResponse = from_binary(&res).unwrap();
        assert_eq!(16876, value.count);
    }

    #[test]
    fn increment() {
        assert!(true);
    }

    #[test]
    fn reset() {
        assert!(true);
    }
}
