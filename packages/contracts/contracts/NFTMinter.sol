// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMinter is ERC1155 {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    constructor(string memory _baseURI) ERC1155(_baseURI) {}

    function mint(
        address account,
        uint256 amount,
        bytes memory data
    ) public returns (uint256) {
        _tokenIds.increment();

        uint256 id = _tokenIds.current();
        _mint(account, id, amount, data);

        return id;
    }
}
