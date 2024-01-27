pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./IStakeManager.sol";
import "./RolesManager.sol";
import "./RolesIds.sol";

contract StakeManagerV2 is IStakeManager, RolesManager, UUPSUpgradeable{

    uint256 public registrationDepositAmount;
    uint256 public registrationWaitTime;

    struct Staker {
        uint256 balance;
        uint256 registrationTime;
    }

    mapping(address => Staker) public stakers;


    function initialize(address _admin, uint256 _registrationDepositAmount, uint256 _registrationWaitTime) public initializer {
        __Roles_init(_admin);
        registrationDepositAmount = _registrationDepositAmount;
        registrationWaitTime = _registrationWaitTime;
    }

    function setConfiguration(uint256 _registrationDepositAmount, uint256 _registrationWaitTime) public onlyAdmin {
        registrationDepositAmount = _registrationDepositAmount;
        registrationWaitTime = _registrationWaitTime;
    }

    function register() external payable {
        require(!isRegistered(msg.sender), "Already registered");
        require(msg.value == registrationDepositAmount, "Incorrect balance amount");

        _addStaker(msg.sender);
        stakers[msg.sender] = Staker({
        balance: msg.value,
        registrationTime: block.timestamp
        });
    }

    function unregister() external onlyStaker {
        require(block.timestamp >= stakers[msg.sender].registrationTime + registrationWaitTime, "Registration period not ended");

        uint256 amount = stakers[msg.sender].balance;
        stakers[msg.sender].balance = 0;
        payable(msg.sender).transfer(amount);

        _removeStaker(msg.sender);
    }

    function stake() external payable onlyStaker {
        stakers[msg.sender].balance += msg.value;
    }

    function unstake() external onlyStaker {
        require(block.timestamp >= stakers[msg.sender].registrationTime + registrationWaitTime, "Registration period not ended");
        uint256 amount = stakers[msg.sender].balance;
        stakers[msg.sender].balance = 0;
        payable(msg.sender).transfer(amount);
    }

    function slash(address staker, uint256 amount) external onlyAdmin {
        require(stakers[staker].balance >= amount, "Not enough balance to slash");
        stakers[staker].balance -= amount;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyAdmin {}

    function isRegistered(address _addr) public view returns(bool){
        return _roleByAddress[_addr][RolesIds.Staker];
    }

    function getStakeBalance(address _addr) public view returns(uint256) {
        return stakers[_addr].balance;
    }

    function getVersion() public view returns(string memory) {
        return "Version 2.0";
    }
}
