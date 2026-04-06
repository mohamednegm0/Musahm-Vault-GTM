namespace Core.Constants;

public static class ConstDefaultWorkspaces
{
    public static readonly Dictionary<string, string> Defaults = new()
    {
        { BoardMeetings, BoardType },
        { AssociationMeetings, AssociationType },
        { CommitteeMeetings, CommitteeType },
        { Decisions, DecisionType },
        { ContractDocumentation, ContractType },
        { PoliciesAndRegulations, RegulationsType }
    };

    // Workspace Names (Arabic)
    public const string BoardMeetings = "اجتماعات مجلس الإدارة";
    public const string AssociationMeetings = "اجتماعات الجمعيات";
    public const string CommitteeMeetings = "اجتماعات اللجان";
    public const string Decisions = "القرارات";
    public const string ContractDocumentation = "توثيق العقود";
    public const string PoliciesAndRegulations = "السياسات واللوائح";

    // Workspace Types
    public const string BoardType = "Board";
    public const string AssociationType = "Association";
    public const string CommitteeType = "Committee";
    public const string DecisionType = "Decision";
    public const string ContractType = "Contract";
    public const string RegulationsType = "Regulations";
}
