// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TransferHelper {
    bytes4 private constant TRANSFER_SELECTOR = bytes4(keccak256(bytes("transfer(address,uint256)")));
    bytes4 private constant TRANSFER_FROM_SELECTOR = bytes4(keccak256(bytes("transferFrom(address,address,uint256)")));

    function _safeTransferERC20(address token, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(TRANSFER_SELECTOR, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TransferHelper : Transfer failed");
    }

    function _safeTransferFromERC20(address token, address from, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(TRANSFER_FROM_SELECTOR, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TransferHelper : Transfer from failed");
    }
}
