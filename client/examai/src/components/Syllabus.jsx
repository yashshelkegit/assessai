import React, { useState, useEffect } from "react";

const Syllabus = () => {
	const [subjects, setSubjects] = useState([]);
	const [newSubject, setNewSubject] = useState("");
	const [selectedFiles, setSelectedFiles] = useState({});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const [newChapter, setNewChapter] = useState({
		chapterNo: "",
		chapterName: "",
		topics: "",
		weightage: "",
	});

	useEffect(() => {
		fetchSyllabi();
	}, []);

	const fetchSyllabi = async () => {
		try {
			setLoading(true);
			const response = await fetch("http://localhost:3002/api/syllabus");
			const data = await response.json();
			// Transform API data to match our component's structure
			const transformedData = data.map((item) => ({
				id: item._id,
				name: item.sub,
				chapters: item.chapters.map((chapter) => ({
					id: chapter._id || Date.now(),
					chapterNo: chapter.no,
					chapterName: chapter.name,
					topics: chapter.topics.join(", "),
					weightage: chapter.weightage,
				})),
				books: [],
			}));
			setSubjects(transformedData);
            
		} catch (err) {
			setError("Failed to fetch syllabi");
		} finally {
			setLoading(false);
		}
	};

	const addSubject = async () => {
		if (newSubject.trim()) {
			try {
				const response = await fetch(
					"http://localhost:3002/api/syllabus/create",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							sub: newSubject,
							chapters: [],
						}),
					}
				);

				if (!response.ok) throw new Error("Failed to create subject");

				const data = await response.json();
				setSubjects([
					...subjects,
					{
						id: data._id,
						name: data.sub,
						chapters: [],
						books: [],
					},
				]);
				setNewSubject("");
			} catch (err) {
				setError("Failed to add subject");
			}
		}
	};

	const addChapter = async (subjectId) => {
		if (newChapter.chapterName && newChapter.chapterNo) {
			try {
				const subject = subjects.find((s) => s.id === subjectId);
				if (!subject) return;

				const transformedChapter = {
					no: parseInt(newChapter.chapterNo),
					name: newChapter.chapterName,
					topics: newChapter.topics.split(",").map((t) => t.trim()),
					weightage: parseInt(newChapter.weightage),
				};

				const response = await fetch(
					`http://localhost:3002/api/syllabus/${subjectId}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							sub: subject.name,
							chapters: [
								...subject.chapters.map((ch) => ({
									no: ch.chapterNo,
									name: ch.chapterName,
									topics: ch.topics.split(",").map((t) => t.trim()),
									weightage: parseInt(ch.weightage),
								})),
								transformedChapter,
							],
						}),
					}
				);

				if (!response.ok) throw new Error("Failed to add chapter");

				setSubjects(
					subjects.map((s) => {
						if (s.id === subjectId) {
							return {
								...s,
								chapters: [
									...s.chapters,
									{
										id: Date.now(),
										...newChapter,
									},
								],
							};
						}
						return s;
					})
				);

				setNewChapter({
					chapterNo: "",
					chapterName: "",
					topics: "",
					weightage: "",
				});
			} catch (err) {
				setError("Failed to add chapter");
			}
		}
	};

	const handleFileUpload = async (subjectId, event) => {
		try {
			const files = Array.from(event.target.files);
			const formData = new FormData();

			files.forEach((file) => {
				formData.append("books", file);
			});

			const response = await fetch(
				`http://localhost:3002/api/syllabus/${subjectId}/books`,
				{
					method: "POST",
					body: formData, // Don't set Content-Type header - browser will set it with boundary
				}
			);

			if (!response.ok) throw new Error("Failed to upload books");

			const updatedSyllabus = await response.json();

			setSubjects(
				subjects.map((subject) => {
					if (subject.id === subjectId) {
						return {
							...subject,
							books: updatedSyllabus.books,
						};
					}
					return subject;
				})
			);
		} catch (err) {
			setError("Failed to upload books");
		}
	};

	const deleteBook = async (subjectId, bookId) => {
		try {
			const response = await fetch(
				`http://localhost:3002/api/syllabus/${subjectId}/books/${bookId}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) throw new Error("Failed to delete book");

			const updatedSyllabus = await response.json();

			setSubjects(
				subjects.map((subject) => {
					if (subject.id === subjectId) {
						return {
							...subject,
							books: updatedSyllabus.books,
						};
					}
					return subject;
				})
			);
		} catch (err) {
			setError("Failed to delete book");
		}
	};

	const deleteChapter = async (subjectId, chapterId) => {
		try {
			const subject = subjects.find((s) => s.id === subjectId);
			if (!subject) return;

			const updatedChapters = subject.chapters.filter(
				(ch) => ch.id !== chapterId
			);

			const response = await fetch(
				`http://localhost:3002/api/syllabus/${subjectId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						sub: subject.name,
						chapters: updatedChapters.map((ch) => ({
							no: ch.chapterNo,
							name: ch.chapterName,
							topics: ch.topics.split(",").map((t) => t.trim()),
							weightage: parseInt(ch.weightage),
						})),
					}),
				}
			);

			if (!response.ok) throw new Error("Failed to delete chapter");

			setSubjects(
				subjects.map((s) => {
					if (s.id === subjectId) {
						return {
							...s,
							chapters: updatedChapters,
						};
					}
					return s;
				})
			);
		} catch (err) {
			setError("Failed to delete chapter");
		}
	};

	return (
		<div className="p-6 max-w-6xl mx-auto">
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			)}

			<div className="mb-8">
				<h1 className="text-2xl font-bold mb-4">Syllabus Manager</h1>
				<div className="flex gap-2 mb-4">
					<input
						type="text"
						value={newSubject}
						onChange={(e) => setNewSubject(e.target.value)}
						placeholder="Add new subject"
						className="border p-2 rounded flex-1"
					/>
					<button
						onClick={addSubject}
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						Add Subject
					</button>
				</div>
			</div>

			{loading ? (
				<div className="text-center py-4">Loading...</div>
			) : (
				subjects.map((subject) => (
					<div key={subject.id} className="mb-8 border rounded-lg p-6">
						<h2 className="text-xl font-bold mb-6">{subject.name}</h2>

						<div className="mb-8">
							<h3 className="text-lg font-semibold mb-4">Syllabus Topics</h3>

							<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
								<input
									type="text"
									value={newChapter.chapterNo}
									onChange={(e) =>
										setNewChapter({ ...newChapter, chapterNo: e.target.value })
									}
									placeholder="Chapter No."
									className="border p-2 rounded"
								/>
								<input
									type="text"
									value={newChapter.chapterName}
									onChange={(e) =>
										setNewChapter({
											...newChapter,
											chapterName: e.target.value,
										})
									}
									placeholder="Chapter Name"
									className="border p-2 rounded"
								/>
								<input
									type="text"
									value={newChapter.topics}
									onChange={(e) =>
										setNewChapter({ ...newChapter, topics: e.target.value })
									}
									placeholder="Topics (comma separated)"
									className="border p-2 rounded"
								/>
								<input
									type="text"
									value={newChapter.weightage}
									onChange={(e) =>
										setNewChapter({ ...newChapter, weightage: e.target.value })
									}
									placeholder="Weightage (%)"
									className="border p-2 rounded"
								/>
							</div>
							<button
								onClick={() => addChapter(subject.id)}
								className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
							>
								Add Chapter
							</button>

							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<thead>
										<tr className="bg-gray-100">
											<th className="border p-2 text-left">Chapter No.</th>
											<th className="border p-2 text-left">Chapter Name</th>
											<th className="border p-2 text-left">Topics Covered</th>
											<th className="border p-2 text-left">Weightage</th>
											<th className="border p-2 text-left">Actions</th>
										</tr>
									</thead>
									<tbody>
										{subject.chapters.map((chapter) => (
											<tr key={chapter.id}>
												<td className="border p-2">{chapter.chapterNo}</td>
												<td className="border p-2">{chapter.chapterName}</td>
												<td className="border p-2">{chapter.topics}</td>
												<td className="border p-2">{chapter.weightage}</td>
												<td className="border p-2">
													<button
														onClick={() =>
															deleteChapter(subject.id, chapter.id)
														}
														className="text-red-500 hover:text-red-600"
													>
														Delete
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						<div>
							{/* <h3 className="text-lg font-semibold mb-4">Books</h3>
							<div className="mb-4">
								<input
									type="file"
									multiple
									onChange={(e) => handleFileUpload(subject.id, e)}
									className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
								/>
							</div> */}
							{/* <ul className="space-y-2">
								{subject.books.map((book) => (
									<li
										key={book.id}
										className="flex justify-between items-center bg-gray-50 p-2 rounded"
									>
										<span>{book.name}</span>
										<button
											onClick={() => deleteBook(subject.id, book.id)}
											className="text-red-500 hover:text-red-600"
										>
											Delete
										</button>
									</li>
								))}
							</ul> */}
						</div>
					</div>
				))
			)}
		</div>
	);
};

export default Syllabus;
