pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./RolesIds.sol";

abstract contract RolesManager is Initializable {

    address public admin;
    mapping(address => mapping(bytes32 => bool)) internal _roleByAddress;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not an admin");
        _;
    }

    modifier onlyStaker() {
        require(_roleByAddress[msg.sender][RolesIds.Staker] == true, "Not a staker");
        _;
    }

    function __Roles_init(address _admin) internal {
        admin = _admin;
    }

    function _addStaker(address _addr) internal {
        _roleByAddress[_addr][RolesIds.Staker] = true;
    }

    function _removeStaker(address _addr) internal {
        _roleByAddress[_addr][RolesIds.Staker] = false;
    }
}
