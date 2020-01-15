using Sabio.Data.Providers;
using Sabio.Models.Domain;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using Sabio.Data;
using Sabio.Models.Requests;
using Sabio.Models;

namespace Sabio.Services
{
    public class FAQService : IFAQService
    {
        private IDataProvider _data;
        public FAQService(IDataProvider data)
        {
            _data = data;
        }


        public void DeleteById(int id)
        {
            string procName = "dbo.FAQs_Delete";
            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection faqCollection)
            {
                faqCollection.AddWithValue("@Id", id);
            }
          );
        }

        public List<FAQ> GetById(int id)
        {
            string procName = "[dbo].[FAQs_Select_ById]";
            List<FAQ> list = null;
            FAQ faq = null;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection faqCollection)
            {
                faqCollection.AddWithValue("@Id", id);

            }, delegate (IDataReader reader, short set) //single Record Mapper
            {

                faq = MapFAQs(reader, out int index);

                if (list == null)
                {
                    list = new List<FAQ>();
                };
                list.Add(faq);
               
            }
         );
            return list;
        }

        public Paged<FAQ> GetByCreatedBy(int createdBy, int pageIndex, int pageSize)
        {
            string procName = "dbo.FAQs_Select_ByCreatedBy";
            Paged<FAQ> pagedList = null;
            List<FAQ> list = null;
            int totalCount = 0;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection faqCollection)
                {
                    faqCollection.AddWithValue("@CreatedBy", createdBy);
                    faqCollection.AddWithValue("@PageIndex", pageIndex);
                    faqCollection.AddWithValue("@PageSize", pageSize);
                },
                    delegate (IDataReader reader, short set)
                {
                   
                    FAQ faq = MapFAQs(reader, out int index);

                    if (list == null)
                    {
                        totalCount = reader.GetSafeInt32(index);
                        list = new List<FAQ>();
                    }
                    list.Add(faq);
                }
            );

            if (list != null)
            {
                pagedList = new Paged<FAQ>(list, pageIndex, pageSize, totalCount);
            }

            return pagedList;
        }

        public List<FAQ> GetAll() //SelectAll()
        {
            string procName = "dbo.FAQs_SelectAll";
            List<FAQ> faqList = null;
         

            _data.ExecuteCmd(procName,null,
           delegate (IDataReader reader, short set)
            {

                FAQ faq = MapFAQs(reader, out int index);

                if (faqList == null)
                {
                  
                    faqList = new List<FAQ>();
                }
                faqList.Add(faq);
            }
          );

            return faqList;
        }

        public void Update(FAQUpdateRequest model, int userId)
        {
            string procName = "dbo.FAQs_Update";

            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@Question", model.Question);
                    paramCollection.AddWithValue("@Answer", model.Answer);
                    paramCollection.AddWithValue("@CategoryId", model.CategoryId);
                    paramCollection.AddWithValue("@SortOrder", model.SortOrder);
                    paramCollection.AddWithValue("@Id", model.Id);
                    
                },
            returnParameters: null);

        }
        public int Add(FAQAddRequest model, int userId)
        {
            string procName = "dbo.FAQs_Insert";
            int id = 0;

            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@Question", model.Question);
                    paramCollection.AddWithValue("@Answer", model.Answer);
                    paramCollection.AddWithValue("@CategoryId", model.CategoryId);
                    paramCollection.AddWithValue("@SortOrder", model.SortOrder);
                    paramCollection.AddWithValue("@CreatedBy", userId);


                    SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                    idOut.Direction = ParameterDirection.Output;

                    paramCollection.Add(idOut);

                },
            returnParameters: delegate (SqlParameterCollection returnCollection)
            {
                object oId = returnCollection["@Id"].Value;
                int.TryParse(oId.ToString(), out id);
                Console.WriteLine("");
            }
          );
            return id;
        }
        public List<FAQ> Get()
        {
            string procName = "dbo.FAQs_SelectAllDetails";
            List<FAQ> faqList = null;

            _data.ExecuteCmd(procName, null,
                delegate (IDataReader reader, short set)
                {
                    FAQ pmodel = MapFAQs(reader, out int index);
                    if (faqList == null)
                    {
                        faqList = new List<FAQ>();
                    }
                    faqList.Add(pmodel);
                }
             );
            return faqList;
        }
        public List<FAQCategories> GetCategories()
        {
            string procName = "[dbo].[FAQCategories_SelectAll]";
            List<FAQCategories> list = null;

            _data.ExecuteCmd(procName, null,
            delegate (IDataReader reader, short set)
            {

                FAQCategories faqCategories = MapFAQCategories(reader);

                if (list == null)
                {
                    list = new List<FAQCategories>();
                }

                list.Add(faqCategories);
            }
        );

            return list;
        }

        private static FAQCategories MapFAQCategories(IDataReader reader)
        {
            FAQCategories faqCategories = new FAQCategories();

            int index = 0;
            faqCategories.Id = reader.GetSafeInt32(index);
            faqCategories.Name = reader.GetSafeString(index);

            return faqCategories;
        }
        private static FAQ MapFAQs(IDataReader reader, out int index)
        {
            FAQ faq = new FAQ();
            index = 0;

            faq.Id = reader.GetSafeInt32(index++);
            faq.Question = reader.GetSafeString(index++);
            faq.Answer = reader.GetSafeString(index++);
            faq.CategoryId = reader.GetSafeInt32(index++);
            faq.SortOrder = reader.GetSafeInt32(index++);
            faq.DateCreated = reader.GetSafeDateTime(index++);
            faq.DateModified = reader.GetSafeDateTime(index++);
            faq.CreatedBy = reader.GetSafeInt32(index++);
            faq.ModifiedBy = reader.GetSafeInt32(index++);
            
            return faq;
        }
    }
}
