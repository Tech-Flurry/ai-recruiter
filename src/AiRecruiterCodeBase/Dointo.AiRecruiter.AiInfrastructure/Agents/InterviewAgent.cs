﻿using Dointo.AiRecruiter.AiInfrastructure.Config;
using Dointo.AiRecruiter.AiInfrastructure.Utils;
using Dointo.AiRecruiter.Application.AiAbstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.ValueObjects;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Dointo.AiRecruiter.AiInfrastructure.Agents;
internal class InterviewAgent(AiProviderFactory aiProviderFactory, IHttpClientFactory clientFactory) : IInterviewAgent
{
	private readonly AiProviderFactory _aiProviderFactory = aiProviderFactory;
	private readonly IHttpClientFactory _clientFactory = clientFactory;

	public async Task<string> GenerateInterviewStarter(string jobTitle, string candidateName)
	{
		var aiProvider = _aiProviderFactory.GetProvider(AiProviders.OpenAi);
		var context = "You are a recruitment expert and taking interview of a candidate. You need to start the interview by easing the candidate and asking to introduce themselves.";
		var prompt = @$"You are hiring for the job: {jobTitle}. The Name of the candidate in front of you is ""{candidateName}"". Briefly introduce yourself and let them know that you are an ai recruiter named 'Riku'. Then, ask them to intoduce themselves.
Instructions:
- Keep your tone friendly
- Don't use jargons or fluff
- Only use simple English words";
		var completion = await aiProvider.GetCompletionAsync(OpenAiModels.GPT_4_1, context, prompt, JsonUtils.GetJsonSchemaOf(typeof(QuestionCompletionDto)), "question");
		return JsonSerializer.Deserialize<QuestionCompletionDto>(completion)?.Question ?? string.Empty;
	}

	public async Task<string> GenerateNextQuestionAsync(Interview interview, Candidate candidate)
	{
		var aiProvider = _aiProviderFactory.GetProvider(AiProviders.OpenAi);
		var context = "You are a technical recruitment expert and you need to generate the next question for a candidate in an interview. You're a human not a bot.";
		var prompt = @$"You are hiring for the job: {interview.Job.JobTitle}. Required Experience for the job is {interview.Job.RequiredExperience} years. The Name of the candidate in front of you is ""{interview.Interviewee.Name}"". The candidate has answered the following questions:
{JsonSerializer.Serialize(interview.Questions.Select(x => x.Question))}
Required skills for the job are: {string.Join(", ", interview.Job.RequiredSkills)}.
Job Description: {interview.Job.JobDescription}.
Instructions:
- You need to generate the next question for the candidate
- The question should be related to the job and the skills required for it
- The question can be related to the previous questions asked in the interview
- The question should be open ended and allow the candidate to explain their thought process
- The question should be related to the candidate's current experience which is {interview.Interviewee.Experience} years
- The question should not be too easy or too difficult, it should be appropriate for the candidate's experience level
- The question should not be repetitive or already asked in the interview
- The question should not be too long or too short, it should be concise and to the point
- We usually needs 5-7 against each required skill and almost 20-25 question in an interview, so if you think there are enough questions against all skills then simple send the `Terminate` flag as `true`
- The question can be related to the candidate's past experiences, skills, or knowledge Experiences -> {JsonSerializer.Serialize(candidate.Experiences)}, Skills -> {JsonSerializer.Serialize(candidate.Skills)}
- You can ask role based questions instead of simple techincal definitions
- If the candidate is using abusive language or looks like wasting our time then simply terminate the interview by sending `Terminate` flag as `true`
- Beyond these given technical skills, you should also ask questions about soft skills like team work, team building, agile project management etc. 
- Use simple English words and avoid jargons or fluff
- You should maintain a friendly tone
- You should sound like a real human instead of a bot
- Change the pattern of your sentence each time to make it realistic
- Do not call candidate's Name every time
- You should always sound natural";
		var completion = await aiProvider.GetCompletionAsync(OpenAiModels.GPT_4_1, context, prompt, JsonUtils.GetJsonSchemaOf(typeof(QuestionCompletionDto)), "question");
		return JsonSerializer.Deserialize<QuestionCompletionDto>(completion)?.Question ?? string.Empty;
	}

	public async Task<(string analysis, double score)> ScoreInterviewAsync(Interview interview)
	{
		var aiProvider = _aiProviderFactory.GetProvider(AiProviders.OpenAi);
		var context = "You are a technical recruitment expert and you need to score the overall interview of a candidate for a job.";
		var prompt = @$"You are hiring for the job: {interview.Job.JobTitle}. The candidate has answered the following questions: {JsonSerializer.Serialize(interview.Questions)}.
Job Description: {interview.Job.JobDescription}.
Required skills for the job are: {string.Join(", ", interview.Job.RequiredSkills)}.
Experience required: {interview.Job.RequiredExperience} years.
Instructions:
- You need to score the overall interview out of 10
- There's field name {nameof(ScoredQuestion.ScoreObtained)} and another field {nameof(ScoredQuestion.TotalScore)} in the interview questions, you need to use these fields to calculate the overall score
- The score should be based on the total score obtained by the candidate in all the questions asked
- The score can not be greater than 10
- The score can be upto 2 decimal digits like 9.56, 8.25 etc., but can also be in a single digit
- The score will only depend on how well the candidate answered the questions asked
- The candidate's current experience is {interview.Interviewee.Experience}, so adjust the difficulty level according to that
- You score should reflect that how likely you recommend this candidate for the job
- With score you also need to provide a brief analysis of the candidate's performance in the interview
- The analysis should be concise and to the point, not more than 3-4 sentences
- The analysis should include the strengths and weaknesses of the candidate based on their answers
- The analysis should also include any red flags or concerns you have about the candidate
- The analysis should be based on the candidate's answers to the questions asked in the interview
- The analysis should include the candidate's fit for the job based on their skills and experience
- You have to match the required skills and experience level with the candidate's score per question";
		var completion = await aiProvider.GetCompletionAsync(OpenAiModels.GPT_4_1, context, prompt, JsonUtils.GetJsonSchemaOf(typeof(ScoredInterviewCompletionDto)), "score");
		var scoreCompletion = JsonSerializer.Deserialize<ScoredInterviewCompletionDto>(completion) ?? new ScoredInterviewCompletionDto(string.Empty, 0);
		return (scoreCompletion.Analysis, scoreCompletion.Score);
	}
	public async Task<string> GenerateCandidatePerformanceOverviewAsync(List<Interview> interviews)
	{
		if (interviews is { Count: 0 })
		{
			return "No interview data available to generate performance overview.";
		}

		var aiProvider = _aiProviderFactory.GetProvider(AiProviders.OpenAi);

		var context = "You are a virtual interview coach. You need to provide constructive, encouraging feedback to the candidate based on their past interview performance.";

		var prompt = @$"
You've recently completed several interviews — here’s a personalized performance summary to guide your growth and highlight your strengths. Below is a summary of your interview data:

{JsonSerializer.Serialize(interviews.Select(i => new
		{
			Job = i.Job?.JobTitle,
			InterviewDate = i.StartTime.ToShortDateString( ),
			Ai_Score = i.AiScore,
			SkillScores = i.ScoredSkills,
			ScoredQuestions = i.Questions
		}))}

Instructions:
- Write a brief, encouraging performance summary for the candidate (3–4 sentences) 
- Address the candidate directly using “you”
- Highlight strengths that appear consistently (e.g., ""Your communication skills are strong"")
- Mention one or two improvement areas in a supportive tone
- If applicable, acknowledge improvement or consistency over time
- Use a motivating and positive tone (like a coach or mentor would)
- Avoid formal or recruiter-style language
";

		var completion = await aiProvider.GetCompletionAsync(
			OpenAiModels.GPT_4_1,
			context,
			prompt
		);

		return completion?.Trim( ) ?? "Unable to generate performance summary at this time.";
	}


	public async Task<(ScoredQuestion question, bool terminate)> ScoreQuestionAsync(Interview interview, Question question)
	{
		const int TOTAL_SCORE = 5;
		var aiProvider = _aiProviderFactory.GetProvider(AiProviders.OpenAi);
		var context = "You are a technical recruitment expert and you need to score the answer of a candidate for a question asked in an interview.";
		var prompt = @$"You are hiring for the job: {interview.Job.JobTitle}. Required Experience for the job is {interview.Job.RequiredExperience} years. The question asked to the candidate is ""{question.Text}"" and they gave the answer ""{question.Answer}"".
Job Description: {interview.Job.JobDescription}.
Previous Questions: {JsonSerializer.Serialize(interview.Questions)}
Required skills for the job are: {string.Join(", ", interview.Job.RequiredSkills)}.
Instructions:
- You need to score the question out of {TOTAL_SCORE}
- The score can not be greater than {TOTAL_SCORE}
- It can be upto 2 decimal digits like 4.56, 3.25 etc., but can also be in a single digit
- The candidate may not be a native english speaker so don't deduct grammatical mistakes marks
- The score will only depend on how well the answer is according to the question
- The candidate's current experience is {interview.Interviewee.Experience}, so adjust the difficulty level according to that
- You can also use relative marking based on previous questions provided in json
- We only require score obtained against a question. Don't give us unncessary details
- We don't use negative marking so if you're unsatisfied with any answer, simply score 0";
		var completion = await aiProvider.GetCompletionAsync(OpenAiModels.GPT_4_1, context, prompt, JsonUtils.GetJsonSchemaOf(typeof(ScoredQuestionCompletionDto)), "score");
		var scoreCompletion = JsonSerializer.Deserialize<ScoredQuestionCompletionDto>(completion) ?? new ScoredQuestionCompletionDto(0, true);
		return (new ScoredQuestion
		{
			Question = question,
			ScoreObtained = scoreCompletion.Score,
			TotalScore = TOTAL_SCORE
		}, scoreCompletion.Terminate);
	}

	public Task<List<SkillRating>> ScoreSkillsAsync(Interview interview)
	{
		var aiProvider = _aiProviderFactory.GetProvider(AiProviders.OpenAi);
		var context = "You are a technical recruitment expert and you need to score the skills of a candidate based on their interview.";
		var prompt = @$"You are hiring for the job: {interview.Job.JobTitle}. The candidate has answered the following questions: {JsonSerializer.Serialize(interview.Questions)}. Required Experience for the job is {interview.Job.RequiredExperience} years.
Required skills for the job are: {string.Join(", ", interview.Job.RequiredSkills)}.
Instructions:
- You need to score the skills of the candidate based on their answers in the interview
- The score should be out of 5 for each skill
- The score can not be greater than 5
- The score should be in integer format like 1, 2, 3, 4, 5
- The score will only depend on how well the candidate answered the questions related to the skills
- The candidate's current experience is {interview.Interviewee.Experience}, so adjust the difficulty level according to that
- The score should reflect the candidate's proficiency in the required skills
- The score should be based on the candidate's answers to the questions asked in the interview
- The score should be based on the candidate's fit for the job based on their skills and experience
- You have to match the required skills with the candidate's score per question
- Provide the scores in a json array with skill Name and score in the given schema for skills";
		var completion = aiProvider.GetCompletionAsync(OpenAiModels.GPT_4_1, context, prompt, JsonUtils.GetJsonSchemaOf(typeof(ScoredSkillsCompletionDto)), "skills");
		return completion.ContinueWith(task =>
		{
			var skillsCompletion = JsonSerializer.Deserialize<ScoredSkillsCompletionDto>(task.Result) ?? new ScoredSkillsCompletionDto( );
			return skillsCompletion.Skills;
		});
	}

	public async Task<double> GetAiScore(string text)
	{
		if (string.IsNullOrWhiteSpace(text))
			return 0;
		try
		{
			text = SanitizeTextForJson(text);
			if (text.Length > 5000)
				text = text[..5000];

			var client = _clientFactory.CreateClient(Setup.AI_DETECTOR);
			Console.WriteLine($"Sending to AI detector: {text}");
			var jsonPayload = JsonSerializer.Serialize(new { text });
			var stringContent = new StringContent(
				jsonPayload,
				System.Text.Encoding.UTF8,
				"application/json");

			var response = await client.PostAsync("api/ScoreFunction", stringContent);
			var responseContent = await response.Content.ReadAsStringAsync( );
			Console.WriteLine($"Response status: {response.StatusCode}, Content: {responseContent}");

			if (!response.IsSuccessStatusCode)
				return 0;

			var dto = JsonSerializer.Deserialize<AiScoreDto>(responseContent);
			if (dto == null)
				return 0;

			return dto.Score;
		}
		catch (Exception ex)
		{
			Console.WriteLine($"Error calling AI detector: {ex.Message}");
			return 0;
		}
	}

	private static string SanitizeTextForJson(string text)
	{
		if (string.IsNullOrEmpty(text))
			return string.Empty;
		text = text.Replace("\r\n", " ")
				   .Replace("\n", " ")
				   .Replace("\r", " ")
				   .Replace("\t", " ")
				   .Replace("\b", "");
		var sanitizedChars = text.Where(c => !char.IsControl(c)).ToArray( );
		return new string(sanitizedChars);
	}

	private sealed record ScoredQuestionCompletionDto(double Score, bool Terminate);
	private sealed record QuestionCompletionDto(string Question);
	private sealed record ScoredInterviewCompletionDto(string Analysis, double Score);
	private sealed record AiScoreRequest([property: JsonPropertyName("text")] string Text);
	private sealed record AiScoreDto([property: JsonPropertyName("score")] double Score, [property: JsonPropertyName("label")] string Label);
	private sealed record ScoredSkillsCompletionDto( )
	{
		public List<SkillRating> Skills { get; set; } = [ ];
	}
}
